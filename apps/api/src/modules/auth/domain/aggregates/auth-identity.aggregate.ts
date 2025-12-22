import { BaseAggregateRoot } from '@/shared-kernel/domain/base-aggregate-root'

import type { AuthProvider } from '@/modules/auth/domain/value-objects/auth-provider'

/**
 * AuthIdentity Aggregate Root
 *
 * Manages user authentication identities, compatible with better-auth accounts table:
 * - email: Email/password authentication (password field)
 * - google/github: OAuth authentication (token field)
 * - phone: Phone authentication
 *
 * Design notes:
 * - One user can have multiple authentication identities
 * - password only used for password-based auth (OAuth is null)
 */
export class AuthIdentity extends BaseAggregateRoot {
  readonly #id: string
  readonly #userId: string
  readonly #providerId: AuthProvider
  readonly #accountId: string
  #password: string | null
  #accessToken: string | null
  #refreshToken: string | null
  #accessTokenExpiresAt: Date | null
  #refreshTokenExpiresAt: Date | null
  #scope: string | null
  readonly #createdAt: Date
  #updatedAt: Date

  private constructor(
    id: string,
    userId: string,
    providerId: AuthProvider,
    accountId: string,
    password: string | null,
    accessToken: string | null,
    refreshToken: string | null,
    accessTokenExpiresAt: Date | null,
    refreshTokenExpiresAt: Date | null,
    scope: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super()
    this.#id = id
    this.#userId = userId
    this.#providerId = providerId
    this.#accountId = accountId
    this.#password = password
    this.#accessToken = accessToken
    this.#refreshToken = refreshToken
    this.#accessTokenExpiresAt = accessTokenExpiresAt
    this.#refreshTokenExpiresAt = refreshTokenExpiresAt
    this.#scope = scope
    this.#createdAt = createdAt
    this.#updatedAt = updatedAt
  }

  /**
   * Create email/password authentication identity
   *
   * @param passwordHash Hashed password (processed by PasswordHasher at Service layer)
   */
  static createEmailIdentity(
    id: string,
    userId: string,
    email: string,
    passwordHash: string,
  ): AuthIdentity {
    const now = new Date()

    return new AuthIdentity(
      id,
      userId,
      'email',
      email.toLowerCase(), // accountId = email
      passwordHash,
      null,
      null,
      null,
      null,
      null,
      now,
      now,
    )
  }

  /**
   * Create OAuth authentication identity
   */
  static createOAuthIdentity(
    id: string,
    userId: string,
    provider: 'google' | 'github',
    accountId: string,
    accessToken?: string,
    refreshToken?: string,
    accessTokenExpiresAt?: Date,
    refreshTokenExpiresAt?: Date,
    scope?: string,
  ): AuthIdentity {
    const now = new Date()

    return new AuthIdentity(
      id,
      userId,
      provider,
      accountId,
      null, // OAuth has no password
      accessToken ?? null,
      refreshToken ?? null,
      accessTokenExpiresAt ?? null,
      refreshTokenExpiresAt ?? null,
      scope ?? null,
      now,
      now,
    )
  }

  /**
   * Create phone authentication identity
   */
  static createPhoneIdentity(
    id: string,
    userId: string,
    phone: string,
  ): AuthIdentity {
    const now = new Date()

    return new AuthIdentity(
      id,
      userId,
      'phone',
      phone, // accountId = phone
      null, // Phone uses verification code
      null,
      null,
      null,
      null,
      null,
      now,
      now,
    )
  }

  /**
   * Reconstitute from database
   */
  static reconstitute(
    id: string,
    userId: string,
    providerId: AuthProvider,
    accountId: string,
    password: string | null,
    accessToken: string | null,
    refreshToken: string | null,
    accessTokenExpiresAt: Date | null,
    refreshTokenExpiresAt: Date | null,
    scope: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): AuthIdentity {
    return new AuthIdentity(
      id,
      userId,
      providerId,
      accountId,
      password,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      scope,
      createdAt,
      updatedAt,
    )
  }

  /**
   * Change password (password-based auth only)
   *
   * @param newPasswordHash Hashed new password (processed by PasswordHasher at Service layer)
   */
  changePassword(newPasswordHash: string): void {
    if (this.#providerId !== 'email') {
      throw new Error('Only email authentication supports password change')
    }
    this.#password = newPasswordHash
    this.#updatedAt = new Date()
  }

  /**
   * Update OAuth tokens
   */
  updateTokens(
    accessToken: string,
    refreshToken?: string,
    accessTokenExpiresAt?: Date,
    refreshTokenExpiresAt?: Date,
    scope?: string,
  ): void {
    this.#accessToken = accessToken
    if (refreshToken !== undefined) {
      this.#refreshToken = refreshToken
    }
    if (accessTokenExpiresAt !== undefined) {
      this.#accessTokenExpiresAt = accessTokenExpiresAt
    }
    if (refreshTokenExpiresAt !== undefined) {
      this.#refreshTokenExpiresAt = refreshTokenExpiresAt
    }
    if (scope !== undefined) {
      this.#scope = scope
    }
    this.#updatedAt = new Date()
  }

  /**
   * Check if password verification is required
   */
  get requiresPassword(): boolean {
    return this.#providerId === 'email'
  }

  // Getters
  get id(): string {
    return this.#id
  }

  get userId(): string {
    return this.#userId
  }

  get providerId(): AuthProvider {
    return this.#providerId
  }

  // Alias for compatibility
  get provider(): AuthProvider {
    return this.#providerId
  }

  get accountId(): string {
    return this.#accountId
  }

  // Alias for compatibility with code expecting identifier
  get identifier(): string {
    return this.#accountId
  }

  get password(): string | null {
    return this.#password
  }

  // Alias for compatibility
  get credentialHash(): string | null {
    return this.#password
  }

  get accessToken(): string | null {
    return this.#accessToken
  }

  get refreshToken(): string | null {
    return this.#refreshToken
  }

  get accessTokenExpiresAt(): Date | null {
    return this.#accessTokenExpiresAt
  }

  get refreshTokenExpiresAt(): Date | null {
    return this.#refreshTokenExpiresAt
  }

  get scope(): string | null {
    return this.#scope
  }

  get createdAt(): Date {
    return this.#createdAt
  }

  get updatedAt(): Date {
    return this.#updatedAt
  }
}
