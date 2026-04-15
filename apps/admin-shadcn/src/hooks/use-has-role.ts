'use client'

import { useUser } from '@/components/user-provider'
import { hasRequiredRole } from '@/lib/rbac'

import type { RoleType } from '@/lib/rbac'

export interface CurrentUser {
  id: string
  email: string
  role: RoleType
}

/**
 * Narrowed current-user view. Returns null when unauthenticated or when
 * the stored cookie has no role.
 */
export function useCurrentUser(): CurrentUser | null {
  const user = useUser()
  if (!user || !user.role) return null
  return { id: user.id, email: user.email, role: user.role }
}

/**
 * Returns true when the current user satisfies `required` (or outranks it).
 */
export function useHasRole(required: RoleType): boolean {
  const user = useCurrentUser()
  return hasRequiredRole(user?.role, required)
}
