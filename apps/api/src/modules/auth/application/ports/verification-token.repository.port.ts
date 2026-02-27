/**
 * Verification Token Repository injection token
 */
export const VERIFICATION_TOKEN_REPOSITORY = Symbol('VERIFICATION_TOKEN_REPOSITORY')

/**
 * Verification token data structure
 *
 * Adapts better-auth verifications table:
 * - identifier: email / phone number
 * - value: token value
 * - no type field; identifier is used to distinguish purpose
 */
export interface VerificationToken {
  id: string
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
}

/**
 * Verification Token Repository interface
 *
 * Temporary verification token management:
 * - Password reset
 * - Email verification
 * - Phone verification
 *
 * Design characteristics:
 * - Only one valid token per identifier
 * - Deleted immediately after verification (single-use)
 */
export interface VerificationTokenRepository {
  /**
   * Create a verification token (overwrites any existing token for the same identifier)
   */
  create(data: {
    identifier: string
    value: string
    expiresAt: Date
  }): Promise<VerificationToken>

  /**
   * Find by token value
   */
  findByValue(value: string): Promise<VerificationToken | null>

  /**
   * Find by identifier
   */
  findByIdentifier(identifier: string): Promise<VerificationToken | null>

  /**
   * Delete a token (called after successful verification)
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete by identifier
   */
  deleteByIdentifier(identifier: string): Promise<boolean>

  /**
   * Delete expired tokens (scheduled cleanup)
   */
  deleteExpired(): Promise<number>

  /**
   * Check whether a token is valid (exists and not expired)
   */
  isValid(value: string): Promise<boolean>
}
