import { OrderStatus } from '@/modules/order/domain/enums/order-status.enum'
import { OrderCancelledEvent } from '@/modules/order/domain/events/order-cancelled.event'
import { OrderCreatedEvent } from '@/modules/order/domain/events/order-created.event'
import { OrderPaidEvent } from '@/modules/order/domain/events/order-paid.event'
import { BaseAggregateRoot } from '@/shared-kernel/domain/base-aggregate-root'

import type { Money } from '@/modules/order/domain/value-objects/money.vo'
import type { OrderItem } from '@/modules/order/domain/value-objects/order-item.vo'

/** The version field is used for optimistic locking */
export class Order extends BaseAggregateRoot {
  readonly #id: string
  readonly #userId: string
  #status: OrderStatus
  readonly #items: OrderItem[]
  readonly #totalAmount: Money
  #version: number
  readonly #createdAt: Date
  #updatedAt: Date

  private constructor(
    id: string,
    userId: string,
    status: OrderStatus,
    items: OrderItem[],
    totalAmount: Money,
    version: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super()
    this.#id = id
    this.#userId = userId
    this.#status = status
    this.#items = items
    this.#totalAmount = totalAmount
    this.#version = version
    this.#createdAt = createdAt
    this.#updatedAt = updatedAt
  }

  /** Initial status is PENDING_PAYMENT */
  static create(
    id: string,
    userId: string,
    items: OrderItem[],
    totalAmount: Money,
  ): Order {
    if (items.length === 0) {
      throw new Error('An order must contain at least one item')
    }

    const now = new Date()
    const order = new Order(id, userId, OrderStatus.PENDING_PAYMENT, items, totalAmount, 0, now, now)

    order.addDomainEvent(new OrderCreatedEvent(id, userId))

    return order
  }

  static reconstitute(
    id: string,
    userId: string,
    status: OrderStatus,
    items: OrderItem[],
    totalAmount: Money,
    version: number,
    createdAt: Date,
    updatedAt: Date,
  ): Order {
    return new Order(id, userId, status, items, totalAmount, version, createdAt, updatedAt)
  }

  // ========== Getters ==========

  get id(): string {
    return this.#id
  }

  get userId(): string {
    return this.#userId
  }

  get status(): OrderStatus {
    return this.#status
  }

  get items(): readonly OrderItem[] {
    return [...this.#items]
  }

  get totalAmount(): Money {
    return this.#totalAmount
  }

  get version(): number {
    return this.#version
  }

  get createdAt(): Date {
    return this.#createdAt
  }

  get updatedAt(): Date {
    return this.#updatedAt
  }

  // ========== Business methods ==========

  /** Only orders in PENDING_PAYMENT status can be paid */
  pay(): void {
    if (this.#status !== OrderStatus.PENDING_PAYMENT) {
      throw new Error(`Payment is not allowed in the current status ${this.#status}; the order must be in pending_payment status`)
    }

    this.#status = OrderStatus.PAID
    this.#version += 1
    this.#updatedAt = new Date()

    this.addDomainEvent(new OrderPaidEvent(this.#id))
  }

  /** Only orders in PAID status can be shipped */
  markShipping(): void {
    if (this.#status !== OrderStatus.PAID) {
      throw new Error(`Shipping is not allowed in the current status ${this.#status}; the order must be in paid status`)
    }

    this.#status = OrderStatus.SHIPPING
    this.#version += 1
    this.#updatedAt = new Date()
  }

  /** Only orders in SHIPPING status can be completed */
  complete(): void {
    if (this.#status !== OrderStatus.SHIPPING) {
      throw new Error(`Completion is not allowed in the current status ${this.#status}; the order must be in shipping status`)
    }

    this.#status = OrderStatus.COMPLETED
    this.#version += 1
    this.#updatedAt = new Date()
  }

  /** Orders in PAID status or beyond cannot be cancelled */
  cancel(): void {
    if (
      this.#status === OrderStatus.PAID
      || this.#status === OrderStatus.SHIPPING
      || this.#status === OrderStatus.COMPLETED
    ) {
      throw new Error(`Cancellation is not allowed in the current status ${this.#status}`)
    }

    if (this.#status === OrderStatus.CANCELLED) {
      throw new Error('Order is already cancelled')
    }

    this.#status = OrderStatus.CANCELLED
    this.#version += 1
    this.#updatedAt = new Date()

    this.addDomainEvent(new OrderCancelledEvent(this.#id))
  }

  canCancel(): boolean {
    return this.#status === OrderStatus.PENDING_PAYMENT
  }
}
