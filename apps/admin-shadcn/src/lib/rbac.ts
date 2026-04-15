import type { components } from '@workspace/api-types'

/**
 * Role type.
 *
 * Source of truth: derived from OpenAPI (`UserResponseDto.role`), which in
 * turn reflects the DB `user_role` pgEnum. Backend counterpart:
 * `apps/api/src/shared-kernel/domain/value-objects/role.vo.ts`.
 */
export type RoleType = components['schemas']['UserResponseDto']['role']

/**
 * Role string constants. Values must match the backend.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const satisfies Record<RoleType, RoleType>

// Role hierarchy (higher index = higher privilege).
// Mirrors backend ROLE_HIERARCHY.
const ROLE_HIERARCHY: RoleType[] = ['USER', 'ADMIN']

/**
 * Returns true when `actor` meets or exceeds the `required` role.
 * Returns false when `actor` is null/undefined.
 */
export function hasRequiredRole(
  actor: RoleType | null | undefined,
  required: RoleType,
): boolean {
  if (!actor) return false
  return ROLE_HIERARCHY.indexOf(actor) >= ROLE_HIERARCHY.indexOf(required)
}
