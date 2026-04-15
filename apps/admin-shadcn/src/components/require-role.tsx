'use client'

import { notFound } from 'next/navigation'

import { useHasRole } from '@/hooks/use-has-role'

import type { RoleType } from '@/lib/rbac'

interface Props {
  role: RoleType
  children: React.ReactNode
}

/**
 * Page-level guard.
 *
 * Renders `children` when the current user satisfies `role`; otherwise
 * triggers Next.js `notFound()` so URL tampering fails closed with a 404.
 * The backend still returns 403 for API calls — this is UX, not enforcement.
 */
export function RequireRole({ role, children }: Props): React.ReactElement | null {
  const allowed = useHasRole(role)
  if (!allowed) notFound()
  return <>{children}</>
}

/**
 * Element-level visibility hint.
 *
 * Renders `children` when allowed, otherwise null. Use for buttons,
 * menu items, and table columns that should disappear for unauthorized users.
 */
export function ShowForRole({ role, children }: Props): React.ReactElement | null {
  const allowed = useHasRole(role)
  return allowed ? <>{children}</> : null
}
