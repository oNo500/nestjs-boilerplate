import { createMock } from '@golevelup/ts-vitest'
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { vi } from 'vitest'

import { OrderFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { CACHE_PORT } from '@/modules/cache/application/ports/cache.port'
import { JOB_REPOSITORY, JobStatus } from '@/modules/order/application/ports/job.repository.port'
import { ORDER_REPOSITORY } from '@/modules/order/application/ports/order.repository.port'
import { OrderService } from '@/modules/order/application/services/order.service'
import { DomainEventPublisher } from '@/shared-kernel/infrastructure/events/domain-event-publisher'

import type { CachePort } from '@/modules/cache/application/ports/cache.port'
import type { JobRepository } from '@/modules/order/application/ports/job.repository.port'
import type { OrderRepository } from '@/modules/order/application/ports/order.repository.port'
import type { TestingModule } from '@nestjs/testing'
import type { Mocked } from 'vitest'

describe('orderService', () => {
  let service: OrderService
  let orderRepository: Mocked<OrderRepository>
  let jobRepository: Mocked<JobRepository>
  let cache: Mocked<CachePort>
  let domainEventPublisher: Mocked<DomainEventPublisher>

  const TEST_USER_ID = 'user-id-1'
  const TEST_ITEMS = [{ productId: 'prod-001', quantity: 2, unitPrice: '99.99' }]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: ORDER_REPOSITORY, useValue: createMock<OrderRepository>() },
        { provide: JOB_REPOSITORY, useValue: createMock<JobRepository>() },
        { provide: CACHE_PORT, useValue: createMock<CachePort>() },
        { provide: DomainEventPublisher, useValue: createMock<DomainEventPublisher>() },
      ],
    }).compile()

    service = module.get<OrderService>(OrderService)
    orderRepository = module.get(ORDER_REPOSITORY)
    jobRepository = module.get(JOB_REPOSITORY)
    cache = module.get(CACHE_PORT)
    domainEventPublisher = module.get(DomainEventPublisher)

    orderRepository.save.mockResolvedValue()
    domainEventPublisher.publishEventsForAggregate.mockResolvedValue()
    domainEventPublisher.publish.mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================
  // createOrder
  // ============================================================

  describe('createOrder', () => {
    it('cache miss → creates order, saves idempotency cache, replayed=false', async () => {
      cache.get.mockImplementation(() => Promise.resolve())
      orderRepository.save.mockResolvedValue()
      cache.set.mockResolvedValue()

      const idempotencyKey = 'key-001'
      const bodyHash = OrderService.computeBodyHash({ userId: TEST_USER_ID, items: TEST_ITEMS })

      const result = await service.createOrder(idempotencyKey, bodyHash, {
        userId: TEST_USER_ID,
        items: TEST_ITEMS,
      })

      expect(result.replayed).toBe(false)
      expect(result.order).toBeDefined()
      expect(result.order.userId).toBe(TEST_USER_ID)
      expect(orderRepository.save).toHaveBeenCalledOnce()
      expect(cache.set).toHaveBeenCalledWith(
        `idempotency:${idempotencyKey}`,
        expect.objectContaining({ hash: bodyHash }),
        expect.any(Number),
      )
    })

    it('cache hit + hash matches → returns cached order, replayed=true, no save', async () => {
      const cachedOrder = OrderFixtures.pendingOrder({ id: 'cached-order-id' })
      const bodyHash = OrderService.computeBodyHash({ userId: TEST_USER_ID, items: TEST_ITEMS })

      cache.get.mockResolvedValue({
        hash: bodyHash,
        response: { id: 'cached-order-id' },
      })
      orderRepository.findById.mockResolvedValue(cachedOrder)

      const result = await service.createOrder('key-001', bodyHash, {
        userId: TEST_USER_ID,
        items: TEST_ITEMS,
      })

      expect(result.replayed).toBe(true)
      expect(result.order.id).toBe('cached-order-id')
      expect(orderRepository.save).not.toHaveBeenCalled()
    })

    it('cache hit + hash mismatch → UnprocessableEntityException(IDEMPOTENCY_KEY_REUSE_CONFLICT)', async () => {
      cache.get.mockResolvedValue({
        hash: 'original-hash',
        response: { id: 'original-order-id' },
      })

      await expect(
        service.createOrder('key-001', 'different-hash', {
          userId: TEST_USER_ID,
          items: TEST_ITEMS,
        }),
      ).rejects.toThrow(UnprocessableEntityException)
    })
  })

  // ============================================================
  // payOrder
  // ============================================================

  describe('payOrder', () => {
    it('not found → NotFoundException', async () => {
      orderRepository.findById.mockResolvedValue(null)

      await expect(service.payOrder('non-existent-id', 0)).rejects.toThrow(NotFoundException)
    })

    it('already paid → ConflictException(ORDER_ALREADY_PAID)', async () => {
      const paidOrder = OrderFixtures.paidOrder()
      orderRepository.findById.mockResolvedValue(paidOrder)

      await expect(service.payOrder(paidOrder.id, paidOrder.version)).rejects.toThrow(ConflictException)
    })

    it('success → calls saveWithVersion, publishes OrderPaidEvent', async () => {
      const pendingOrder = OrderFixtures.pendingOrder()
      orderRepository.findById.mockResolvedValue(pendingOrder)
      orderRepository.saveWithVersion.mockResolvedValue()

      const result = await service.payOrder(pendingOrder.id, 0)

      expect(result.status).toBe('paid')
      expect(orderRepository.saveWithVersion).toHaveBeenCalledWith(result, 0)
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(result)
    })
  })

  // ============================================================
  // shipOrder
  // ============================================================

  describe('shipOrder', () => {
    it('not found → NotFoundException', async () => {
      orderRepository.findById.mockResolvedValue(null)

      await expect(service.shipOrder('non-existent-id')).rejects.toThrow(NotFoundException)
    })

    it('success → creates job, marks shipping, publishes events, returns jobId', async () => {
      const paidOrder = OrderFixtures.paidOrder({ id: 'order-to-ship' })
      orderRepository.findById.mockResolvedValue(paidOrder)

      const mockJob = {
        id: 'job-id-1',
        type: 'ship_order',
        status: JobStatus.PENDING,
        payload: { orderId: 'order-to-ship' },
        result: null,
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      jobRepository.create.mockResolvedValue(mockJob)

      const result = await service.shipOrder('order-to-ship')

      expect(result.jobId).toBe('job-id-1')
      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ship_order', payload: { orderId: 'order-to-ship' } }),
      )
      expect(orderRepository.save).toHaveBeenCalled()
      expect(domainEventPublisher.publishEventsForAggregate).toHaveBeenCalled()
      expect(domainEventPublisher.publish).toHaveBeenCalled()
    })
  })

  // ============================================================
  // bulkCancel
  // ============================================================

  describe('bulkCancel', () => {
    it('all succeed → succeeded=n, failed=0', async () => {
      const order1 = OrderFixtures.pendingOrder({ id: 'order-1' })
      const order2 = OrderFixtures.pendingOrder({ id: 'order-2' })
      orderRepository.findById
        .mockResolvedValueOnce(order1)
        .mockResolvedValueOnce(order2)

      const result = await service.bulkCancel(['order-1', 'order-2'])

      expect(result.succeeded).toBe(2)
      expect(result.failed).toBe(0)
      expect(result.items.every((item) => item.status === 204)).toBe(true)
    })

    it('not found → status 404, does not abort subsequent processing', async () => {
      const validOrder = OrderFixtures.pendingOrder({ id: 'order-valid' })
      orderRepository.findById
        .mockResolvedValueOnce(null) // first: not found
        .mockResolvedValueOnce(validOrder) // second: found and cancellable

      const result = await service.bulkCancel(['order-not-found', 'order-valid'])

      expect(result.succeeded).toBe(1)
      expect(result.failed).toBe(1)
      const notFoundItem = result.items.find((i) => i.id === 'order-not-found')
      expect(notFoundItem?.status).toBe(404)
      const validItem = result.items.find((i) => i.id === 'order-valid')
      expect(validItem?.status).toBe(204)
    })

    it('cannot cancel (paid order) → status 409, does not abort subsequent processing', async () => {
      const paidOrder = OrderFixtures.paidOrder({ id: 'order-paid' })
      const pendingOrder = OrderFixtures.pendingOrder({ id: 'order-pending' })
      orderRepository.findById
        .mockResolvedValueOnce(paidOrder)
        .mockResolvedValueOnce(pendingOrder)

      const result = await service.bulkCancel(['order-paid', 'order-pending'])

      expect(result.succeeded).toBe(1)
      expect(result.failed).toBe(1)
      const paidItem = result.items.find((i) => i.id === 'order-paid')
      expect(paidItem?.status).toBe(409)
    })
  })
})
