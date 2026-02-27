/**
 * OrderItem value object
 *
 * Represents a single line item within an order
 */
export class OrderItem {
  readonly #productId: string
  readonly #quantity: number
  readonly #unitPrice: string

  private constructor(productId: string, quantity: number, unitPrice: string) {
    this.#productId = productId
    this.#quantity = quantity
    this.#unitPrice = unitPrice
  }

  static create(productId: string, quantity: number, unitPrice: string): OrderItem {
    if (!productId || productId.trim().length === 0) {
      throw new Error('productId must not be empty')
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Quantity must be a positive integer: ${quantity}`)
    }
    const price = Number.parseFloat(unitPrice)
    if (Number.isNaN(price) || price < 0) {
      throw new Error(`Invalid unit price: ${unitPrice}`)
    }
    return new OrderItem(productId.trim(), quantity, price.toFixed(2))
  }

  get productId(): string {
    return this.#productId
  }

  get quantity(): number {
    return this.#quantity
  }

  get unitPrice(): string {
    return this.#unitPrice
  }

  /**
   * Line item subtotal amount
   */
  get subtotal(): string {
    return (Number.parseFloat(this.#unitPrice) * this.#quantity).toFixed(2)
  }

  toPlain(): { productId: string, quantity: number, unitPrice: string } {
    return {
      productId: this.#productId,
      quantity: this.#quantity,
      unitPrice: this.#unitPrice,
    }
  }
}
