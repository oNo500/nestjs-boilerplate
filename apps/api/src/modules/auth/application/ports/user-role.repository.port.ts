import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * User Role Repository injection token
 */
export const USER_ROLE_REPOSITORY = Symbol('USER_ROLE_REPOSITORY')

/**
 * User Role Repository interface
 *
 * Single-role management (adapts better-auth usersTable.role field)
 */
export interface UserRoleRepository {
  /**
   * Set the role for a user
   */
  setRole(userId: string, role: RoleType | null): Promise<void>

  /**
   * Get the role for a user
   */
  getRole(userId: string): Promise<RoleType | null>

  /**
   * Check whether a user has the specified role
   */
  hasRole(userId: string, role: RoleType): Promise<boolean>

  /**
   * Get all user IDs that have the specified role
   */
  getUserIdsByRole(role: RoleType): Promise<string[]>
}
