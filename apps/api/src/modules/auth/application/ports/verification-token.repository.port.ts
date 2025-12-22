/**
 * Verification Token Repository token
 */
export const VERIFICATION_TOKEN_REPOSITORY = Symbol('VERIFICATION_TOKEN_REPOSITORY')

/**
 * Verification Token data structure
 *
 * Compatible with better-auth verifications table:
 * - identifier: email/phone number
 * - value: token value
 * - No type field, distinguished by identifier
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
 * Design features:
 * - Only one valid token per identifier
 * - Auto-delete after verification (self-destruct)
 */
export interface VerificationTokenRepository {
  /**
   * Create verification token (overwrites existing token for same identifier)
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
   * Delete token (called after successful verification)
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
   * Check if token is valid (exists and not expired)
   */
  isValid(value: string): Promise<boolean>
}
