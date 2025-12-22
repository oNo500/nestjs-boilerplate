import type { AuthSession } from '@/modules/auth/domain/entities/auth-session.entity'

/**
 * Auth Session Repository token
 */
export const AUTH_SESSION_REPOSITORY = Symbol('AUTH_SESSION_REPOSITORY')

/**
 * Auth Session Repository interface
 *
 * Session management:
 * - Refresh Token storage and validation
 * - Device tracking (ipAddress + userAgent)
 * - Session revocation = delete record (compatible with better-auth)
 */
export interface AuthSessionRepository {
  /**
   * Save session
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
   * Find all active sessions by user ID (not expired)
   */
  findActiveByUserId(userId: string): Promise<AuthSession[]>

  /**
   * Find all sessions by user ID
   */
  findAllByUserId(userId: string): Promise<AuthSession[]>

  /**
   * Delete session (revoke = delete)
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
