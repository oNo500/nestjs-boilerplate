/**
 * Money value object
 *
 * Combines an amount with a currency unit.
 * Immutable; equality is compared by value.
 */
export class Money {
  readonly #amount: string
  readonly #currency: string

  private constructor(amount: string, currency: string) {
    this.#amount = amount
    this.#currency = currency
  }

  static create(amount: string, currency = 'CNY'): Money {
    const parsed = Number.parseFloat(amount)
    if (Number.isNaN(parsed) || parsed < 0) {
      throw new Error(`Invalid amount: ${amount}`)
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new Error(`Invalid currency code: ${currency}`)
    }
    return new Money(parsed.toFixed(2), currency)
  }

  get amount(): string {
    return this.#amount
  }

  get currency(): string {
    return this.#currency
  }

  equals(other: Money): boolean {
    return this.#amount === other.#amount && this.#currency === other.#currency
  }
}
