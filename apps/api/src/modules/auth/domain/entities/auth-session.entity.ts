/**
 * AuthSession Entity
 *
 * Manages user sessions (Refresh Token):
 * - Token storage (compatible with better-auth)
 * - Device tracking support (ipAddress + userAgent)
 * - Session revocation = delete record
 */
export class AuthSession {
  readonly #id: string
  readonly #userId: string
  readonly #token: string
  readonly #expiresAt: Date
  readonly #ipAddress: string | null
  readonly #userAgent: string | null
  readonly #createdAt: Date

  private constructor(
    id: string,
    userId: string,
    token: string,
    expiresAt: Date,
    ipAddress: string | null,
    userAgent: string | null,
    createdAt: Date,
  ) {
    this.#id = id
    this.#userId = userId
    this.#token = token
    this.#expiresAt = expiresAt
    this.#ipAddress = ipAddress
    this.#userAgent = userAgent
    this.#createdAt = createdAt
  }

  /**
   * Create new session
   */
  static create(
    id: string,
    userId: string,
    token: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
  ): AuthSession {
    return new AuthSession(
      id,
      userId,
      token,
      expiresAt,
      ipAddress ?? null,
      userAgent ?? null,
      new Date(),
    )
  }

  /**
   * Reconstitute from database
   */
  static reconstitute(
    id: string,
    userId: string,
    token: string,
    expiresAt: Date,
    ipAddress: string | null,
    userAgent: string | null,
    createdAt: Date,
  ): AuthSession {
    return new AuthSession(
      id,
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
      createdAt,
    )
  }

  /**
   * Check if session is valid (not expired)
   * Note: In better-auth, session revocation = delete record, so only check expiration here
   */
  get isValid(): boolean {
    return this.#expiresAt > new Date()
  }

  /**
   * Check if session is expired
   */
  get isExpired(): boolean {
    return this.#expiresAt <= new Date()
  }

  // Getters
  get id(): string {
    return this.#id
  }

  get userId(): string {
    return this.#userId
  }

  get token(): string {
    return this.#token
  }

  get expiresAt(): Date {
    return this.#expiresAt
  }

  get ipAddress(): string | null {
    return this.#ipAddress
  }

  get userAgent(): string | null {
    return this.#userAgent
  }

  get createdAt(): Date {
    return this.#createdAt
  }
}
