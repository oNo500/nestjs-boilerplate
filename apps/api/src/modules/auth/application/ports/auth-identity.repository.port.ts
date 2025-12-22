import type { AuthIdentity } from '@/modules/auth/domain/aggregates/auth-identity.aggregate'
import type { AuthProvider } from '@/modules/auth/domain/value-objects/auth-provider'

/**
 * Auth Identity Repository token
 */
export const AUTH_IDENTITY_REPOSITORY = Symbol('AUTH_IDENTITY_REPOSITORY')

/**
 * Auth Identity Repository interface
 *
 * Manages authentication identities (compatible with better-auth accounts table):
 * - email: Email/password authentication
 * - google/github: OAuth authentication
 * - phone: Phone authentication
 */
export interface AuthIdentityRepository {
  /**
   * Save authentication identity (create or update)
   */
  save(identity: AuthIdentity): Promise<void>

  /**
   * Find by ID
   */
  findById(id: string): Promise<AuthIdentity | null>

  /**
   * Find all authentication methods by user ID
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
   * Find by provider and account ID (for login)
   * accountId: email/OAuth account ID/phone number
   */
  findByProviderAndIdentifier(
    provider: AuthProvider,
    accountId: string,
  ): Promise<AuthIdentity | null>

  /**
   * Find by account ID (regardless of provider)
   */
  findByIdentifier(accountId: string): Promise<AuthIdentity | null>

  /**
   * Check if account ID exists
   */
  existsByIdentifier(accountId: string): Promise<boolean>

  /**
   * Delete authentication identity
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete all authentication identities for a user
   */
  deleteByUserId(userId: string): Promise<number>
}
