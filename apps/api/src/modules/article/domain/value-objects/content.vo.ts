export class Content {
  readonly #value: string

  private static readonly MIN_LENGTH_FOR_PUBLISH = 50

  private constructor(value: string) {
    this.#value = value
  }

  static create(value: string): Content {
    const trimmed = value.trim()
    return new Content(trimmed)
  }

  get value(): string {
    return this.#value
  }

  isPublishable(): boolean {
    return this.#value.length >= Content.MIN_LENGTH_FOR_PUBLISH
  }

  equals(other: Content): boolean {
    return this.#value === other.#value
  }

  toString(): string {
    return this.#value
  }
}
