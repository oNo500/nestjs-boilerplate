/**
 * AuthSession entity
 *
 * Manages user sessions (refresh tokens):
 * - Stores the token (adapts better-auth)
 * - Supports device info tracking (ipAddress + userAgent)
 * - Session revocation = record deletion
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
   * Create a new session
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
   * Whether the session is valid (not expired)
   * Note: in better-auth, session revocation = record deletion, so only expiry is checked here
   */
  get isValid(): boolean {
    return this.#expiresAt > new Date()
  }

  /**
   * Whether the session has expired
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
