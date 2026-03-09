/**
 * Order aggregate root pure domain tests — no NestJS Testing Module
 */
import { Order } from '@/modules/order/domain/aggregates/order.aggregate'
import { OrderStatus } from '@/modules/order/domain/enums/order-status.enum'
import { OrderCancelledEvent } from '@/modules/order/domain/events/order-cancelled.event'
import { OrderCreatedEvent } from '@/modules/order/domain/events/order-created.event'
import { OrderPaidEvent } from '@/modules/order/domain/events/order-paid.event'
import { Money } from '@/modules/order/domain/value-objects/money.vo'
import { OrderItem } from '@/modules/order/domain/value-objects/order-item.vo'

function buildItems(): OrderItem[] {
  return [OrderItem.create('prod-001', 1, '99.99')]
}

function buildMoney(): Money {
  return Money.create('99.99', 'CNY')
}

describe('order aggregate', () => {
  describe('create', () => {
    it('throws Error when items array is empty', () => {
      expect(() => Order.create('id-1', 'user-1', [], buildMoney())).toThrow(
        'An order must contain at least one item',
      )
    })

    it('success: status=PENDING_PAYMENT, version=0, emits OrderCreatedEvent', () => {
      const order = Order.create('id-1', 'user-1', buildItems(), buildMoney())

      expect(order.status).toBe(OrderStatus.PENDING_PAYMENT)
      expect(order.version).toBe(0)
      expect(order.userId).toBe('user-1')

      const events = order.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(OrderCreatedEvent)
    })
  })

  describe('pay', () => {
    it('throws Error when not in PENDING_PAYMENT status', () => {
      const order = Order.create('id-1', 'user-1', buildItems(), buildMoney())
      order.pay()

      // Already PAID — cannot pay again
      expect(() => order.pay()).toThrow()
    })

    it('success: status→PAID, version incremented, emits OrderPaidEvent', () => {
      const order = Order.create('id-1', 'user-1', buildItems(), buildMoney())
      order.clearDomainEvents()

      order.pay()

      expect(order.status).toBe(OrderStatus.PAID)
      expect(order.version).toBe(1)

      const events = order.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(OrderPaidEvent)
    })
  })

  describe('cancel', () => {
    it('throws Error when status is PAID', () => {
      const order = Order.create('id-1', 'user-1', buildItems(), buildMoney())
      order.pay()

      expect(() => order.cancel()).toThrow()
    })

    it('throws Error when status is SHIPPING', () => {
      const order = Order.create('id-1', 'user-1', buildItems(), buildMoney())
      order.pay()
      order.markShipping()

      expect(() => order.cancel()).toThrow()
    })

    it('pENDING_PAYMENT → cancel succeeds, emits OrderCancelledEvent', () => {
      const order = Order.create('id-1', 'user-1', buildItems(), buildMoney())
      order.clearDomainEvents()

      order.cancel()

      expect(order.status).toBe(OrderStatus.CANCELLED)
      const events = order.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(OrderCancelledEvent)
    })
  })
})
