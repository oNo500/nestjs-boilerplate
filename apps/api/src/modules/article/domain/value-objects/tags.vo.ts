export class Tags {
  readonly #value: readonly string[]

  private static readonly MAX_TAGS = 10
  private static readonly MAX_TAG_LENGTH = 30

  private constructor(value: readonly string[]) {
    this.#value = value
  }

  /** @throws Error if the tags do not satisfy the constraints */
  static create(value: string[]): Tags {
    const trimmed = value.map((tag) => tag.trim()).filter((tag) => tag.length > 0)
    const unique = [...new Set(trimmed)]

    if (unique.length > Tags.MAX_TAGS) {
      throw new Error(`Number of tags must not exceed ${Tags.MAX_TAGS}`)
    }

    for (const tag of unique) {
      if (tag.length > Tags.MAX_TAG_LENGTH) {
        throw new Error(`Tag length must not exceed ${Tags.MAX_TAG_LENGTH} characters`)
      }
    }

    return new Tags(unique)
  }

  static empty(): Tags {
    return new Tags([])
  }

  get value(): readonly string[] {
    return this.#value
  }

  add(tag: string): Tags {
    const trimmed = tag.trim()

    if (trimmed.length === 0) {
      throw new Error('Tag must not be empty')
    }

    if (trimmed.length > Tags.MAX_TAG_LENGTH) {
      throw new Error(`Tag length must not exceed ${Tags.MAX_TAG_LENGTH} characters`)
    }

    if (this.#value.includes(trimmed)) {
      return this // Already exists, skip duplicate
    }

    if (this.#value.length >= Tags.MAX_TAGS) {
      throw new Error(`Number of tags must not exceed ${Tags.MAX_TAGS}`)
    }

    return new Tags([...this.#value, trimmed])
  }

  remove(tag: string): Tags {
    const filtered = this.#value.filter((t) => t !== tag.trim())
    return new Tags(filtered)
  }

  has(tag: string): boolean {
    return this.#value.includes(tag.trim())
  }

  equals(other: Tags): boolean {
    if (this.#value.length !== other.#value.length) {
      return false
    }

    const sorted1 = [...this.#value].toSorted()
    const sorted2 = [...other.#value].toSorted()

    return sorted1.every((tag, index) => tag === sorted2[index])
  }

  toString(): string {
    return this.#value.join(', ')
  }
}
