export class Title {
  readonly #value: string

  private static readonly MIN_LENGTH = 5
  private static readonly MAX_LENGTH = 200

  private constructor(value: string) {
    this.#value = value
  }

  /** @throws Error if the title does not satisfy the constraints */
  static create(value: string): Title {
    const trimmed = value.trim()

    if (trimmed.length < Title.MIN_LENGTH) {
      throw new Error(`Title must be at least ${Title.MIN_LENGTH} characters long`)
    }

    if (trimmed.length > Title.MAX_LENGTH) {
      throw new Error(`Title must not exceed ${Title.MAX_LENGTH} characters`)
    }

    return new Title(trimmed)
  }

  get value(): string {
    return this.#value
  }

  equals(other: Title): boolean {
    return this.#value === other.#value
  }

  toString(): string {
    return this.#value
  }
}
