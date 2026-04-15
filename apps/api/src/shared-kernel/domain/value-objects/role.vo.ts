import type { UserDatabase } from '@workspace/database'

/**
 * Role type
 *
 * Derived from the database `user_role` enum to keep DB / backend / frontend aligned.
 */
export type RoleType = UserDatabase['role']

/**
 * Role constants
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const satisfies Record<RoleType, RoleType>

/**
 * Role hierarchy (higher index means higher privilege)
 */
export const ROLE_HIERARCHY: RoleType[] = ['USER', 'ADMIN']

/**
 * Checks whether a role satisfies the required minimum role.
 *
 * @param actorRole - The role of the actor
 * @param requiredRole - The minimum required role
 */
export function hasRequiredRole(actorRole: RoleType, requiredRole: RoleType): boolean {
  const actorIndex = ROLE_HIERARCHY.indexOf(actorRole)
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole)
  return actorIndex >= requiredIndex
}
