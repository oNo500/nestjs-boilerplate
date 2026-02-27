import type { AuthSession } from '@/modules/auth/domain/entities/auth-session.entity'

/**
 * Auth Session Repository injection token
 */
export const AUTH_SESSION_REPOSITORY = Symbol('AUTH_SESSION_REPOSITORY')

/**
 * Auth Session Repository interface
 *
 * Unified session management:
 * - Refresh token storage and validation
 * - Device info tracking (ipAddress + userAgent)
 * - Session revocation = record deletion (adapts better-auth)
 */
export interface AuthSessionRepository {
  /**
   * Save a session
   */
  save(session: AuthSession): Promise<void>

  /**
   * Find by ID
   */
  findById(id: string): Promise<AuthSession | null>

  /**
   * Find by token
   */
  findByToken(token: string): Promise<AuthSession | null>

  /**
   * Find all active (non-expired) sessions for a user
   */
  findActiveByUserId(userId: string): Promise<AuthSession[]>

  /**
   * Find all sessions for a user
   */
  findAllByUserId(userId: string): Promise<AuthSession[]>

  /**
   * Delete a session (revoke = delete)
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete all sessions for a user
   */
  deleteAllByUserId(userId: string): Promise<number>

  /**
   * Delete expired sessions
   */
  deleteExpired(): Promise<number>
}
