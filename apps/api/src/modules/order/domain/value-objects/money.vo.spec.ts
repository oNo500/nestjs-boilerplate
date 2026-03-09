/**
 * Money value object pure domain tests — no NestJS Testing Module
 */
import { Money } from '@/modules/order/domain/value-objects/money.vo'

describe('money value object', () => {
  it('throws Error for negative amount', () => {
    expect(() => Money.create('-1.00')).toThrow('Invalid amount')
  })

  it('throws Error for NaN amount', () => {
    expect(() => Money.create('not-a-number')).toThrow('Invalid amount')
  })

  it('throws Error for invalid currency code', () => {
    expect(() => Money.create('10.00', 'US')).toThrow('Invalid currency code')
    expect(() => Money.create('10.00', 'usd')).toThrow('Invalid currency code')
  })

  it('formats amount to two decimal places', () => {
    const money = Money.create('99.9', 'CNY')
    expect(money.amount).toBe('99.90')
  })

  it('equals() compares by value', () => {
    const m1 = Money.create('100.00', 'CNY')
    const m2 = Money.create('100.00', 'CNY')
    const m3 = Money.create('100.00', 'USD')

    expect(m1.equals(m2)).toBe(true)
    expect(m1.equals(m3)).toBe(false)
  })

  it('zero is a valid amount', () => {
    const money = Money.create('0', 'CNY')
    expect(money.amount).toBe('0.00')
  })
})
