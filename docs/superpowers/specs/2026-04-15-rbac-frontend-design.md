# RBAC Frontend Infrastructure — Design

> **Status**: design
> **Date**: 2026-04-15
> **Parent**: `2026-04-15-admin-frontend-redesign-overview.md`
> **Scope**: `apps/admin-shadcn` — role types, hooks, guard components, route-group protection, nav filtering

## Why

The overview committed to dual-role (ADMIN + USER) access through a single entry, with a `/my-*` zone for personal views and ADMIN-only pages guarded at layout level. Before any page work, the primitives that make RBAC declarative must exist:

- Single-source types tied to the OpenAPI schema
- A current-user hook that is cheap everywhere
- Two clearly named guard components (page-level vs element-level)
- A route-group layout that enforces ADMIN at a single point
- Nav filtering driven by a field on `NavItem`, not a URL allowlist

This doc specifies those primitives.

## Architecture

Three layers, each in its conventional directory:

```
src/
├── lib/rbac.ts                   # pure utilities — no React
├── hooks/use-has-role.ts         # useCurrentUser, useHasRole
├── components/require-role.tsx   # <RequireRole>, <ShowForRole>
└── app/(protected)/
    ├── layout.tsx                # login-only guard (existing)
    └── (admin)/layout.tsx        # new — ADMIN guard wrapping admin pages
```

### Dependency direction

```
components/require-role.tsx  →  hooks/use-has-role.ts  →  lib/rbac.ts
                                          ↓
                            components/user-provider.tsx (existing)
```

Nothing else depends on this module group. Consumers import directly (`@/lib/rbac`, `@/hooks/use-has-role`, `@/components/require-role`) — no barrels.

## Components

### `lib/rbac.ts`

Pure, framework-free. One constant, one type, one function. Comment explicitly notes the backend counterpart.

```ts
import type { components } from '@workspace/api-types'

// Source of truth for role string values. Type is derived from OpenAPI
// (UserResponseDto.role) so renaming a role in the DB enum propagates here.
// Runtime values mirror backend `apps/api/src/shared-kernel/domain/value-objects/role.vo.ts`.
export type RoleType = components['schemas']['UserResponseDto']['role']

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const satisfies Record<RoleType, RoleType>

// Role hierarchy: later entries are higher privilege.
// Mirrors backend ROLE_HIERARCHY.
const ROLE_HIERARCHY: RoleType[] = ['USER', 'ADMIN']

export function hasRequiredRole(
  actor: RoleType | null | undefined,
  required: RoleType,
): boolean {
  if (!actor) return false
  return ROLE_HIERARCHY.indexOf(actor) >= ROLE_HIERARCHY.indexOf(required)
}
```

### `hooks/use-has-role.ts`

Thin layer over the existing `useUser` context. Two hooks, same underlying source.

```ts
'use client'

import { useUser } from '@/components/user-provider'
import { hasRequiredRole } from '@/lib/rbac'
import type { RoleType } from '@/lib/rbac'

export interface CurrentUser {
  id: string
  email: string
  role: RoleType
}

export function useCurrentUser(): CurrentUser | null {
  const user = useUser()
  if (!user || !user.role) return null
  return { id: user.id, email: user.email, role: user.role }
}

export function useHasRole(required: RoleType): boolean {
  const user = useCurrentUser()
  return hasRequiredRole(user?.role, required)
}
```

### `components/require-role.tsx`

Two components, single responsibility each. Both client components.

```ts
'use client'

import { notFound } from 'next/navigation'
import { useHasRole } from '@/hooks/use-has-role'
import type { RoleType } from '@/lib/rbac'

interface Props {
  role: RoleType
  children: React.ReactNode
}

// Page-level guard. Renders children when the user satisfies `role`;
// otherwise triggers Next.js not-found (404) so URL tampering fails closed.
export function RequireRole({ role, children }: Props): React.ReactElement | null {
  const allowed = useHasRole(role)
  if (!allowed) notFound()
  return <>{children}</>
}

// Element-level hint. Renders children when allowed, otherwise null.
// Use for buttons, menu items, table columns.
export function ShowForRole({ role, children }: Props): React.ReactElement | null {
  const allowed = useHasRole(role)
  return allowed ? <>{children}</> : null
}
```

**Why `notFound()` instead of redirecting to `/403`:**

- Next.js has a built-in `not-found.tsx` fallback; no new page to design
- Hiding admin URLs from unauthorized users (rather than telling them "forbidden") matches common SaaS UX
- Backend guards still return 403 for API calls — the frontend 404 is UX, not enforcement

### `StoredUser` type change

Existing `lib/token.ts` defines:

```ts
export type StoredUser = { id: string; email: string; role: string | null }
```

Change to:

```ts
import type { RoleType } from '@/lib/rbac'
export type StoredUser = { id: string; email: string; role: RoleType | null }
```

`role` stays nullable at this layer because the cookie can be absent/corrupt; `useCurrentUser` is the narrowing boundary.

## Route Group Guard

New file: `app/(protected)/(admin)/layout.tsx`:

```ts
import { RequireRole } from '@/components/require-role'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role="ADMIN">{children}</RequireRole>
}
```

### Re-organization

All ADMIN-only routes move under `(admin)` route group. URLs do not change (route groups are URL-invisible).

Before:
```
app/(protected)/
├── dashboards/
├── users/
├── roles/
├── login-logs/
├── audit-logs/
├── articles/
├── apps/
├── pages/
└── settings/
```

After:
```
app/(protected)/
├── layout.tsx                  # login-only (existing)
├── (admin)/
│   ├── layout.tsx              # new — ADMIN guard
│   ├── dashboards/
│   ├── users/
│   ├── roles/                  # (to be deleted per overview; kept here for the move)
│   ├── login-logs/
│   ├── audit-logs/
│   ├── articles/
│   ├── apps/
│   └── pages/
├── profile/                    # new zone — any authenticated user
├── my-activity/                # new
├── my-login-logs/              # new
└── settings/                   # moved out of (admin); any authenticated user
```

`/settings` is intentionally outside `(admin)` — in the overview USER keeps access to preferences/password. Individual settings subpages that are admin-only can nest inside `(admin)` later if needed.

`profile/`, `my-activity/`, `my-login-logs/` are stubs in this spec; their implementations belong to the USER self-service sub-design.

## NavItem Schema

Add optional `requiredRole` at the top level only. No recursion into `items` — group-level granularity matches the IA.

```ts
// config/app-paths.ts
export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  requiredRole?: RoleType        // absent = visible to any authenticated user
  items?: { title: string; url: string }[]
}
```

### Sidebar filter

Replace `ADMIN_ONLY_URLS` + `filterByRole` in `components/app-sidebar/index.tsx` with a single helper driven by the new field:

```ts
function visibleItems(items: NavItem[], userRole: RoleType | null): NavItem[] {
  return items.filter((item) =>
    !item.requiredRole || hasRequiredRole(userRole, item.requiredRole),
  )
}
```

Each nav array (`dashboardNavItems`, `appsNavItems`, etc.) gets `requiredRole: 'ADMIN'` on admin-only entries. The `isAdmin` boolean in `AppSidebar` is removed; visibility flows from the data.

## Data Flow

```
Cookie `user` (set on login)
         │
         ▼
getServerUser() in (protected)/layout.tsx          ← SSR
         │
         ▼
<UserProvider user={...}>                          ← existing
         │
         ├─► (admin)/layout.tsx ─► <RequireRole>   ← ADMIN gate
         │
         ├─► <AppSidebar>  ──► visibleItems()     ← menu filter
         │
         └─► feature page ──► <ShowForRole>       ← per-action hints
                         └─► useHasRole()         ← conditional logic
```

Single read point (cookie → context); every consumer reads through `useCurrentUser` / `useHasRole`.

## Error Handling & Edge Cases

| Case | Behavior |
|---|---|
| Cookie absent | `useUser()` returns null → `useCurrentUser()` returns null → `useHasRole()` returns false → `RequireRole` triggers `notFound()`; `(protected)/layout.tsx` already redirects unauthenticated users upstream so this path should be unreachable |
| Cookie role is unknown string (e.g. stale after enum change) | `hasRequiredRole` returns false; user sees empty nav / 404 on admin pages. Acceptable — re-login refreshes cookie |
| Role changes server-side during session | Frontend continues showing old role until re-login or cookie refresh. Backend always re-checks; no security gap, only UX drift |
| User directly hits `/users` URL without ADMIN | `(admin)/layout.tsx` → `RequireRole` → `notFound()` |
| ADMIN has `requiredRole: 'USER'` item | `hasRequiredRole('ADMIN', 'USER')` is true by hierarchy → ADMIN sees USER items too (as intended) |

## Testing Strategy

Unit tests colocated with source.

- **`lib/rbac.spec.ts`**: table-driven `hasRequiredRole` cases (null/undefined actor, equal role, higher/lower role, unknown string if we ever loosen the type)
- **`hooks/use-has-role.spec.tsx`**: wrap in `UserProvider` with fixture users, assert hook returns
- **`components/require-role.spec.tsx`**:
  - `<RequireRole>` renders children when allowed
  - `<RequireRole>` calls `notFound()` when not allowed (mock `next/navigation`)
  - `<ShowForRole>` returns null when not allowed
  - `<ShowForRole>` renders children when allowed

Integration-style test optional and deferred: e2e-style "ADMIN can reach /users, USER gets 404" belongs in a later pass when Playwright or similar is introduced (not in current stack).

## Files Touched

**New:**
- `src/lib/rbac.ts`
- `src/lib/rbac.spec.ts`
- `src/hooks/use-has-role.ts`
- `src/hooks/use-has-role.spec.tsx`
- `src/components/require-role.tsx`
- `src/components/require-role.spec.tsx`
- `src/app/(protected)/(admin)/layout.tsx`

**Modified:**
- `src/lib/token.ts` — tighten `StoredUser.role` type
- `src/config/app-paths.ts` — add `requiredRole?: RoleType` to `NavItem`; annotate admin-only entries
- `src/components/app-sidebar/index.tsx` — remove `ADMIN_ONLY_URLS`, use `visibleItems` helper
- `src/features/user-management/components/users-table.tsx` — remove ad-hoc role string comparisons where applicable (handled in user-management sub-design; here only the type tightening matters)

**Moved (no code change, directory relocation only):**
- `app/(protected)/dashboards/` → `app/(protected)/(admin)/dashboards/`
- `app/(protected)/users/` → `app/(protected)/(admin)/users/`
- `app/(protected)/roles/` → `app/(protected)/(admin)/roles/`
- `app/(protected)/login-logs/` → `app/(protected)/(admin)/login-logs/`
- `app/(protected)/audit-logs/` → `app/(protected)/(admin)/audit-logs/`
- `app/(protected)/articles/` → `app/(protected)/(admin)/articles/`
- `app/(protected)/apps/` → `app/(protected)/(admin)/apps/`
- `app/(protected)/pages/` → `app/(protected)/(admin)/pages/`

## Non-Goals

- Permission-level RBAC (CASL-style `can('read', 'user')`) — stays role-level; the hierarchy array is the extension point
- Reading role from JWT claims instead of a separate `user` cookie — current cookie plumbing already works
- Middleware-based early cut-off — ADMIN guard lives at layout level, per the overview decision
- i18n for role labels — deferred; display-time lookup tables are each feature's concern

## Open Questions

None.
