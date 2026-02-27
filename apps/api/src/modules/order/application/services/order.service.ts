import { createHash } from 'node:crypto'

import { ConflictException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'

import { CACHE_PORT } from '@/modules/cache/application/ports/cache.port'
import { JOB_REPOSITORY, JobStatus } from '@/modules/order/application/ports/job.repository.port'
import { ORDER_REPOSITORY } from '@/modules/order/application/ports/order.repository.port'
import { Order } from '@/modules/order/domain/aggregates/order.aggregate'
import { OrderShipRequestedEvent } from '@/modules/order/domain/events/order-ship-requested.event'
import { Money } from '@/modules/order/domain/value-objects/money.vo'
import { OrderItem } from '@/modules/order/domain/value-objects/order-item.vo'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'
import { DomainEventPublisher } from '@/shared-kernel/infrastructure/events/domain-event-publisher'

import type { CachePort } from '@/modules/cache/application/ports/cache.port'
import type { JobRepository, Job } from '@/modules/order/application/ports/job.repository.port'
import type { OrderRepository } from '@/modules/order/application/ports/order.repository.port'

interface IdempotencyRecord {
  /** SHA-256 hash of the request body */
  hash: string
  /** Cached response data */
  response: Record<string, unknown>
}

export interface BulkCancelItemResult {
  id: string
  status: 204 | 404 | 409 | 422
  error?: { code: string, message: string }
}

export interface BulkCancelResult {
  items: BulkCancelItemResult[]
  succeeded: number
  failed: number
}

export interface CreateOrderInput {
  userId: string
  items: { productId: string, quantity: number, unitPrice: string }[]
  currency?: string
}

/** Idempotency key TTL: 24 hours (in seconds) */
const IDEMPOTENCY_TTL_SECONDS = 86_400

/**
 * Thin orchestrator: idempotent order creation / optimistic-lock payment / async shipping / bulk cancellation
 */
@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: JobRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {}

  /**
   * Idempotent order creation
   *
   * - Cache hit with matching hash: return cached response (idempotent replay)
   * - Cache hit with different hash: throw 422 (same key, different body)
   *
   * @param idempotencyKey Client-generated unique key (UUID)
   * @param bodyHash SHA-256 hash of the request body (computed by the controller)
   * @param input Order creation parameters
   * @returns { order, replayed } - replayed is true when the response is an idempotent replay
   */
  async createOrder(
    idempotencyKey: string,
    bodyHash: string,
    input: CreateOrderInput,
  ): Promise<{ order: Order, replayed: boolean, cachedResponse?: Record<string, unknown> }> {
    const cacheKey = `idempotency:${idempotencyKey}`

    const existing = await this.cache.get<IdempotencyRecord>(cacheKey)

    if (existing) {
      if (existing.hash !== bodyHash) {
        throw new UnprocessableEntityException({
          code: ErrorCode.IDEMPOTENCY_KEY_REUSE_CONFLICT,
          message: `Idempotency-Key "${idempotencyKey}" has already been used with a different request body, please use a new key`,
        })
      }
      const cachedOrderId = existing.response.id as string
      const cachedOrder = await this.orderRepository.findById(cachedOrderId)
      if (cachedOrder) {
        return { order: cachedOrder, replayed: true, cachedResponse: existing.response }
      }
    }

    const items = input.items.map((item) => OrderItem.create(item.productId, item.quantity, item.unitPrice))

    const totalAmount = items
      .reduce((sum, item) => sum + Number.parseFloat(item.subtotal), 0)
      .toFixed(2)

    const order = Order.create(
      crypto.randomUUID(),
      input.userId,
      items,
      Money.create(totalAmount, input.currency ?? 'CNY'),
    )

    await this.orderRepository.save(order)
    await this.domainEventPublisher.publishEventsForAggregate(order)

    const responseSnapshot = this.orderToResponseSnapshot(order)
    await this.cache.set<IdempotencyRecord>(
      cacheKey,
      { hash: bodyHash, response: responseSnapshot },
      IDEMPOTENCY_TTL_SECONDS,
    )

    return { order, replayed: false }
  }

  /**
   * Payment confirmation (optimistic locking)
   *
   * The controller reads expectedVersion from the If-Match header and passes it here.
   * Repository.saveWithVersion validates the version and throws 412 on mismatch.
   *
   * @param id Order ID
   * @param expectedVersion Client-held version number (from ETag / If-Match)
   */
  async payOrder(id: string, expectedVersion: number): Promise<Order> {
    const order = await this.orderRepository.findById(id)
    if (!order) {
      throw new NotFoundException({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: `Order ${id} not found`,
      })
    }

    if (order.status === 'paid' || order.status === 'shipping' || order.status === 'completed') {
      throw new ConflictException({
        code: ErrorCode.ORDER_ALREADY_PAID,
        message: `Order ${id} has already been paid and cannot be paid again`,
      })
    }

    order.pay()

    await this.orderRepository.saveWithVersion(order, expectedVersion)
    await this.domainEventPublisher.publishEventsForAggregate(order)

    return order
  }

  /**
   * Initiate shipping (async operation)
   *
   * Creates a Job record, then publishes OrderShipRequestedEvent for async processing by the event handler.
   * Returns jobId; client polls GET /jobs/:jobId for status.
   */
  async shipOrder(id: string): Promise<{ jobId: string }> {
    const order = await this.orderRepository.findById(id)
    if (!order) {
      throw new NotFoundException({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: `Order ${id} not found`,
      })
    }

    const job = await this.jobRepository.create({
      id: crypto.randomUUID(),
      type: 'ship_order',
      status: JobStatus.PENDING,
      payload: { orderId: id },
      result: null,
      error: null,
    })

    order.markShipping()
    await this.orderRepository.save(order)
    await this.domainEventPublisher.publishEventsForAggregate(order)

    await this.domainEventPublisher.publish(new OrderShipRequestedEvent(id, job.id))

    return { jobId: job.id }
  }

  /**
   * Bulk cancel orders (207 Multi-Status)
   *
   * Processes each order individually; a single failure does not abort the rest.
   */
  async bulkCancel(ids: string[]): Promise<BulkCancelResult> {
    const items: BulkCancelItemResult[] = []

    for (const id of ids) {
      const order = await this.orderRepository.findById(id)

      if (!order) {
        items.push({
          id,
          status: 404,
          error: { code: ErrorCode.ORDER_NOT_FOUND, message: `Order ${id} not found` },
        })
        continue
      }

      if (!order.canCancel()) {
        const code
          = order.status === 'paid' || order.status === 'shipping' || order.status === 'completed'
            ? ErrorCode.ORDER_ALREADY_PAID
            : ErrorCode.ORDER_CANNOT_CANCEL

        items.push({
          id,
          status: 409,
          error: { code, message: `Order ${id} in status ${order.status} cannot be cancelled` },
        })
        continue
      }

      try {
        order.cancel()
        await this.orderRepository.save(order)
        await this.domainEventPublisher.publishEventsForAggregate(order)
        items.push({ id, status: 204 })
      } catch (error) {
        items.push({
          id,
          status: 422,
          error: {
            code: ErrorCode.ORDER_CANNOT_CANCEL,
            message: error instanceof Error ? error.message : 'Cancellation failed',
          },
        })
      }
    }

    const succeeded = items.filter((r) => r.status === 204).length
    const failed = items.length - succeeded

    return { items, succeeded, failed }
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id)
  }

  async findJob(id: string): Promise<Job | null> {
    return this.jobRepository.findById(id)
  }

  /**
   * Computes the SHA-256 hash of the request body, for the controller to calculate before passing it in
   */
  static computeBodyHash(body: unknown): string {
    return createHash('sha256').update(JSON.stringify(body)).digest('hex')
  }

  // ========== Private methods ==========

  private orderToResponseSnapshot(order: Order): Record<string, unknown> {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      items: order.items.map((item) => item.toPlain()),
      totalAmount: order.totalAmount.amount,
      currency: order.totalAmount.currency,
      version: order.version,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }
  }
}
