/**
 * Role type
 *
 * Shared user role definitions
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
