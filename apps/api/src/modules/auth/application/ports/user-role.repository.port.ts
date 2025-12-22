import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * User Role Repository token
 */
export const USER_ROLE_REPOSITORY = Symbol('USER_ROLE_REPOSITORY')

/**
 * User Role Repository interface
 *
 * Single role management (compatible with better-auth usersTable.role field)
 */
export interface UserRoleRepository {
  /**
   * Set user role
   */
  setRole(userId: string, role: RoleType | null): Promise<void>

  /**
   * Get user role
   */
  getRole(userId: string): Promise<RoleType | null>

  /**
   * Check if user has specified role
   */
  hasRole(userId: string, role: RoleType): Promise<boolean>

  /**
   * Get all user IDs with specified role
   */
  getUserIdsByRole(role: RoleType): Promise<string[]>
}
