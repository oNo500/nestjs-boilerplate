import type { AuthIdentity } from '@/modules/auth/domain/aggregates/auth-identity.aggregate'
import type { AuthProvider } from '@/modules/auth/domain/value-objects/auth-provider'

/**
 * Auth Identity Repository injection token
 */
export const AUTH_IDENTITY_REPOSITORY = Symbol('AUTH_IDENTITY_REPOSITORY')

/**
 * Auth Identity Repository interface
 *
 * Unified auth identity management (adapts better-auth accounts table):
 * - email: email/password authentication
 * - google/github: OAuth authentication
 * - phone: phone number authentication
 */
export interface AuthIdentityRepository {
  /**
   * Save an auth identity (create or update)
   */
  save(identity: AuthIdentity): Promise<void>

  /**
   * Find by ID
   */
  findById(id: string): Promise<AuthIdentity | null>

  /**
   * Find all auth identities for a user
   */
  findByUserId(userId: string): Promise<AuthIdentity[]>

  /**
   * Find by user ID and provider
   */
  findByUserIdAndProvider(
    userId: string,
    provider: AuthProvider,
  ): Promise<AuthIdentity | null>

  /**
   * Find by provider and account identifier (used for login)
   * accountId: email / OAuth account ID / phone number
   */
  findByProviderAndIdentifier(
    provider: AuthProvider,
    accountId: string,
  ): Promise<AuthIdentity | null>

  /**
   * Find by account identifier regardless of provider
   */
  findByIdentifier(accountId: string): Promise<AuthIdentity | null>

  /**
   * Check whether an account identifier already exists
   */
  existsByIdentifier(accountId: string): Promise<boolean>

  /**
   * Delete an auth identity
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete all auth identities for a user
   */
  deleteByUserId(userId: string): Promise<number>
}
