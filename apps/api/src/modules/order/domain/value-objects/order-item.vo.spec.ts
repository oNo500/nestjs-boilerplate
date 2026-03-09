/**
 * OrderItem value object pure domain tests — no NestJS Testing Module
 */
import { OrderItem } from '@/modules/order/domain/value-objects/order-item.vo'

describe('orderItem value object', () => {
  it('throws Error for empty productId', () => {
    expect(() => OrderItem.create('', 1, '10.00')).toThrow('productId must not be empty')
    expect(() => OrderItem.create('   ', 1, '10.00')).toThrow('productId must not be empty')
  })

  it('throws Error for quantity ≤ 0', () => {
    expect(() => OrderItem.create('prod-1', 0, '10.00')).toThrow(
      'Quantity must be a positive integer',
    )
    expect(() => OrderItem.create('prod-1', -1, '10.00')).toThrow(
      'Quantity must be a positive integer',
    )
  })

  it('throws Error for non-integer quantity', () => {
    expect(() => OrderItem.create('prod-1', 1.5, '10.00')).toThrow(
      'Quantity must be a positive integer',
    )
  })

  it('computes subtotal correctly', () => {
    const item = OrderItem.create('prod-1', 3, '25.00')
    expect(item.subtotal).toBe('75.00')
  })

  it('trims whitespace from productId', () => {
    const item = OrderItem.create('  prod-1  ', 1, '10.00')
    expect(item.productId).toBe('prod-1')
  })

  it('formats unitPrice to two decimal places', () => {
    const item = OrderItem.create('prod-1', 1, '9.9')
    expect(item.unitPrice).toBe('9.90')
  })
})
