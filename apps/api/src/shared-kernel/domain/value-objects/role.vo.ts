/**
 * Role type
 *
 * User role definitions shared across modules
 */
export type RoleType = 'ADMIN' | 'USER' | 'EDITOR' | 'MODERATOR'

/**
 * Role constants
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  EDITOR: 'EDITOR',
  MODERATOR: 'MODERATOR',
} as const

/**
 * Role hierarchy (higher index means higher privilege)
 */
export const ROLE_HIERARCHY: RoleType[] = [
  'USER',
  'EDITOR',
  'MODERATOR',
  'ADMIN',
]

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
