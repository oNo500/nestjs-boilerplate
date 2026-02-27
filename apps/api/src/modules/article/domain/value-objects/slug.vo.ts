/**
 * Slug value object
 *
 * Encapsulates a URL-friendly identifier.
 */
export class Slug {
  readonly #value: string

  private static readonly SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  private constructor(value: string) {
    this.#value = value
  }

  /**
   * Create a Slug instance.
   *
   * @throws Error if the slug format is invalid
   */
  static create(value: string): Slug {
    const trimmed = value.trim().toLowerCase()

    if (!Slug.SLUG_PATTERN.test(trimmed)) {
      throw new Error('Slug must consist of lowercase letters, digits, and hyphens')
    }

    if (trimmed.length < 3) {
      throw new Error('Slug must be at least 3 characters long')
    }

    if (trimmed.length > 200) {
      throw new Error('Slug must not exceed 200 characters')
    }

    return new Slug(trimmed)
  }

  get value(): string {
    return this.#value
  }

  /**
   * Value object equality comparison
   */
  equals(other: Slug): boolean {
    return this.#value === other.#value
  }

  toString(): string {
    return this.#value
  }
}
