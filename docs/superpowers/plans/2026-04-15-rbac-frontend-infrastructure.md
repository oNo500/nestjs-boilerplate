# RBAC Frontend Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the RBAC primitives (types, hooks, guard components, route-group protection, nav filtering) that the admin frontend redesign depends on.

**Architecture:** Three-layer module group (`lib/rbac.ts` → `hooks/use-has-role.ts` → `components/require-role.tsx`) feeding a new `(admin)` route-group layout and a data-driven sidebar filter. Types derive from the OpenAPI schema so the DB enum stays authoritative.

**Tech Stack:** Next.js 16 (App Router), TypeScript, `@workspace/api-types` (OpenAPI), `@workspace/ui` (shadcn), Vitest + `@testing-library/react`.

---

## Prerequisites

- Phase 1 (backend RBAC alignment) is complete: DB uses `pgEnum('ADMIN', 'USER')`, backend `RoleType` derives from `UserDatabase['role']`, all ports/DTOs non-nullable
- The backend API is runnable locally (`pnpm --filter api dev`) — required for regenerating OpenAPI types in Task 0
- Working directory: repo root (`/Users/xiu/code/nestjs-boilerplate`)

---

## File Structure

**New files:**
- `apps/admin-shadcn/src/lib/rbac.ts` — pure utilities (`ROLES`, `RoleType`, `hasRequiredRole`)
- `apps/admin-shadcn/src/lib/rbac.spec.ts`
- `apps/admin-shadcn/src/hooks/use-has-role.ts` — `useCurrentUser`, `useHasRole`
- `apps/admin-shadcn/src/hooks/use-has-role.spec.tsx`
- `apps/admin-shadcn/src/components/require-role.tsx` — `RequireRole`, `ShowForRole`
- `apps/admin-shadcn/src/components/require-role.spec.tsx`
- `apps/admin-shadcn/src/app/(protected)/(admin)/layout.tsx`

**Modified files:**
- `apps/admin-shadcn/src/lib/token.ts` — tighten `StoredUser.role` type
- `apps/admin-shadcn/src/config/app-paths.ts` — add `requiredRole?: RoleType` to `NavItem`, annotate admin entries
- `apps/admin-shadcn/src/components/app-sidebar/index.tsx` — replace `ADMIN_ONLY_URLS` + `filterByRole` with `visibleItems` driven by `requiredRole`

**Moved files** (directory relocation, no content change — `git mv`):
- `app/(protected)/{dashboards,users,roles,login-logs,audit-logs,articles,apps,pages}` → `app/(protected)/(admin)/...`

---

## Task 0: Regenerate OpenAPI Types

Phase 1 changed the backend `role` type from `string | null` to `'ADMIN' | 'USER'` (non-null). The committed `@workspace/api-types` still reflects the old schema. Downstream tasks require the fresh schema.

**Files:**
- Modify: `packages/api-types/src/openapi.d.ts` (auto-generated)

- [ ] **Step 1: Start the API in one terminal**

Run in terminal A:
```bash
pnpm --filter api dev
```

Wait until the server logs `Listening on port 3000` (or equivalent ready message).

- [ ] **Step 2: Regenerate types**

Run in terminal B:
```bash
pnpm --filter @workspace/api-types api:gen
```

- [ ] **Step 3: Verify the generated role type**

```bash
grep -n 'role' packages/api-types/src/openapi.d.ts | head
```

Expected: `UserResponseDto`'s `role` field is `"ADMIN" | "USER"` (no longer `string | null`, no longer four roles). Stop the API dev server in terminal A.

- [ ] **Step 4: Typecheck the whole workspace**

```bash
pnpm turbo typecheck
```

Expected: `api` and `@workspace/api-types` pass. `admin-shadcn` may still fail in existing call sites that treat `role` as `string | null` — those are fixed in Task 6. Note any failures from packages not touched by this plan (e.g. `@workspace/ui`) — they are pre-existing and out of scope.

- [ ] **Step 5: Commit**

```bash
git add packages/api-types/src/openapi.d.ts
git commit -m "chore(api-types): regenerate after role enum change"
```

---

## Task 1: `lib/rbac.ts` — Types and Pure Utilities

**Files:**
- Create: `apps/admin-shadcn/src/lib/rbac.ts`
- Test: `apps/admin-shadcn/src/lib/rbac.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-shadcn/src/lib/rbac.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { ROLES, hasRequiredRole } from './rbac'

describe('ROLES', () => {
  it('exposes ADMIN and USER values', () => {
    expect(ROLES.ADMIN).toBe('ADMIN')
    expect(ROLES.USER).toBe('USER')
  })
})

describe('hasRequiredRole', () => {
  it('returns false when actor is null', () => {
    expect(hasRequiredRole(null, 'USER')).toBe(false)
  })

  it('returns false when actor is undefined', () => {
    expect(hasRequiredRole(undefined, 'USER')).toBe(false)
  })

  it('returns true when actor equals required', () => {
    expect(hasRequiredRole('USER', 'USER')).toBe(true)
    expect(hasRequiredRole('ADMIN', 'ADMIN')).toBe(true)
  })

  it('returns true when actor outranks required', () => {
    expect(hasRequiredRole('ADMIN', 'USER')).toBe(true)
  })

  it('returns false when actor is below required', () => {
    expect(hasRequiredRole('USER', 'ADMIN')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter admin-shadcn test -- src/lib/rbac.spec.ts
```

Expected: FAIL — "Cannot find module './rbac'".

- [ ] **Step 3: Create `lib/rbac.ts`**

Create `apps/admin-shadcn/src/lib/rbac.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter admin-shadcn test -- src/lib/rbac.spec.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Typecheck**

```bash
pnpm --filter admin-shadcn typecheck
```

Expected: no errors introduced by these files. Pre-existing errors elsewhere in `admin-shadcn` are fixed in later tasks — record them but don't fix yet.

- [ ] **Step 6: Commit**

```bash
git add apps/admin-shadcn/src/lib/rbac.ts apps/admin-shadcn/src/lib/rbac.spec.ts
git commit -m "feat(rbac): add RoleType, ROLES, hasRequiredRole"
```

---

## Task 2: Tighten `StoredUser.role` Type

**Files:**
- Modify: `apps/admin-shadcn/src/lib/token.ts`

- [ ] **Step 1: Modify `StoredUser` type**

Edit `apps/admin-shadcn/src/lib/token.ts`. At the top of the file, add the import:

```ts
import type { RoleType } from '@/lib/rbac'
```

Replace the existing `StoredUser` type:

```ts
export type StoredUser = {
  id: string
  email: string
  role: RoleType | null
}
```

(Keep `role` nullable here — cookie may be absent/corrupt. Narrowing happens in `useCurrentUser`.)

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter admin-shadcn typecheck
```

Expected: call sites that treat `role` as `string | null` now produce errors — these get fixed in later tasks. Note but don't fix.

- [ ] **Step 3: Commit**

```bash
git add apps/admin-shadcn/src/lib/token.ts
git commit -m "feat(rbac): tighten StoredUser.role to RoleType"
```

---

## Task 3: `hooks/use-has-role.ts`

**Files:**
- Create: `apps/admin-shadcn/src/hooks/use-has-role.ts`
- Test: `apps/admin-shadcn/src/hooks/use-has-role.spec.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-shadcn/src/hooks/use-has-role.spec.tsx`:

```tsx
import { renderHook } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { UserProvider } from '@/components/user-provider'

import { useCurrentUser, useHasRole } from './use-has-role'

import type { StoredUser } from '@/lib/token'

function wrapper(user: StoredUser | null) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <UserProvider user={user}>{children}</UserProvider>
  }
}

describe('useCurrentUser', () => {
  it('returns null when no user', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper: wrapper(null) })
    expect(result.current).toBeNull()
  })

  it('returns null when user has no role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: null }
    const { result } = renderHook(() => useCurrentUser(), { wrapper: wrapper(user) })
    expect(result.current).toBeNull()
  })

  it('returns narrowed user when role is set', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    const { result } = renderHook(() => useCurrentUser(), { wrapper: wrapper(user) })
    expect(result.current).toEqual({ id: 'u1', email: 'a@b.com', role: 'ADMIN' })
  })
})

describe('useHasRole', () => {
  it('returns false when no user', () => {
    const { result } = renderHook(() => useHasRole('USER'), { wrapper: wrapper(null) })
    expect(result.current).toBe(false)
  })

  it('returns true when user meets required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    const { result } = renderHook(() => useHasRole('ADMIN'), { wrapper: wrapper(user) })
    expect(result.current).toBe(true)
  })

  it('returns true when user outranks required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    const { result } = renderHook(() => useHasRole('USER'), { wrapper: wrapper(user) })
    expect(result.current).toBe(true)
  })

  it('returns false when user below required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'USER' }
    const { result } = renderHook(() => useHasRole('ADMIN'), { wrapper: wrapper(user) })
    expect(result.current).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter admin-shadcn test -- src/hooks/use-has-role.spec.tsx
```

Expected: FAIL — "Cannot find module './use-has-role'".

- [ ] **Step 3: Create the hook file**

Create `apps/admin-shadcn/src/hooks/use-has-role.ts`:

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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter admin-shadcn test -- src/hooks/use-has-role.spec.tsx
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/admin-shadcn/src/hooks/use-has-role.ts apps/admin-shadcn/src/hooks/use-has-role.spec.tsx
git commit -m "feat(rbac): add useCurrentUser and useHasRole hooks"
```

---

## Task 4: `components/require-role.tsx`

**Files:**
- Create: `apps/admin-shadcn/src/components/require-role.tsx`
- Test: `apps/admin-shadcn/src/components/require-role.spec.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-shadcn/src/components/require-role.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { UserProvider } from '@/components/user-provider'

import { RequireRole, ShowForRole } from './require-role'

import type { StoredUser } from '@/lib/token'

const notFoundMock = vi.hoisted(() => vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
}))

vi.mock('next/navigation', () => ({ notFound: notFoundMock }))

function renderWithUser(user: StoredUser | null, ui: React.ReactElement) {
  return render(<UserProvider user={user}>{ui}</UserProvider>)
}

describe('<RequireRole>', () => {
  it('renders children when user has the required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    renderWithUser(
      user,
      <RequireRole role="ADMIN">
        <div>secret</div>
      </RequireRole>,
    )
    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('calls notFound when user lacks the required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'USER' }
    notFoundMock.mockClear()
    expect(() =>
      renderWithUser(
        user,
        <RequireRole role="ADMIN">
          <div>secret</div>
        </RequireRole>,
      ),
    ).toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})

describe('<ShowForRole>', () => {
  it('renders children when allowed', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    renderWithUser(
      user,
      <ShowForRole role="ADMIN">
        <button>Delete</button>
      </ShowForRole>,
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders nothing when not allowed', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'USER' }
    const { container } = renderWithUser(
      user,
      <ShowForRole role="ADMIN">
        <button>Delete</button>
      </ShowForRole>,
    )
    expect(container.querySelector('button')).toBeNull()
  })

  it('renders nothing when no user', () => {
    const { container } = renderWithUser(
      null,
      <ShowForRole role="USER">
        <span>Hi</span>
      </ShowForRole>,
    )
    expect(container.textContent).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter admin-shadcn test -- src/components/require-role.spec.tsx
```

Expected: FAIL — "Cannot find module './require-role'".

- [ ] **Step 3: Create the component file**

Create `apps/admin-shadcn/src/components/require-role.tsx`:

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter admin-shadcn test -- src/components/require-role.spec.tsx
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/admin-shadcn/src/components/require-role.tsx apps/admin-shadcn/src/components/require-role.spec.tsx
git commit -m "feat(rbac): add <RequireRole> and <ShowForRole>"
```

---

## Task 5: Relocate Admin-Only Routes into `(admin)` Group

**Files:**
- Move: eight directories under `apps/admin-shadcn/src/app/(protected)/`

- [ ] **Step 1: Create the `(admin)` directory**

```bash
mkdir -p apps/admin-shadcn/src/app/\(protected\)/\(admin\)
```

- [ ] **Step 2: Move admin-only route directories with `git mv`**

```bash
cd apps/admin-shadcn/src/app/\(protected\)
for d in dashboards users roles login-logs audit-logs articles apps pages; do
  git mv "$d" "(admin)/$d"
done
cd -
```

- [ ] **Step 3: Verify directory structure**

```bash
ls apps/admin-shadcn/src/app/\(protected\)
ls apps/admin-shadcn/src/app/\(protected\)/\(admin\)
```

Expected:
- `(protected)/` contains: `(admin)`, `_components`, `layout.tsx`, `settings`
- `(admin)/` contains: `apps`, `articles`, `audit-logs`, `dashboards`, `login-logs`, `pages`, `roles`, `users`

- [ ] **Step 4: Typecheck**

```bash
pnpm --filter admin-shadcn typecheck
```

Expected: no new errors from the move. (Pre-existing type errors from Task 2 still present; fixed in Task 6.)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-shadcn/src/app/\(protected\)
git commit -m "refactor(admin): move admin-only routes into (admin) route group"
```

---

## Task 6: `(admin)/layout.tsx` — ADMIN Guard

**Files:**
- Create: `apps/admin-shadcn/src/app/(protected)/(admin)/layout.tsx`

- [ ] **Step 1: Create the guard layout**

Create `apps/admin-shadcn/src/app/(protected)/(admin)/layout.tsx`:

```tsx
import { RequireRole } from '@/components/require-role'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role="ADMIN">{children}</RequireRole>
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter admin-shadcn typecheck
```

Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add apps/admin-shadcn/src/app/\(protected\)/\(admin\)/layout.tsx
git commit -m "feat(rbac): add ADMIN route-group guard layout"
```

---

## Task 7: NavItem `requiredRole` + Sidebar Data-Driven Filter

**Files:**
- Modify: `apps/admin-shadcn/src/config/app-paths.ts`
- Modify: `apps/admin-shadcn/src/components/app-sidebar/index.tsx`

- [ ] **Step 1: Add `requiredRole` to `NavItem` and annotate admin entries**

Edit `apps/admin-shadcn/src/config/app-paths.ts`.

Add this import near the top of the file (below existing icon imports):

```ts
import type { RoleType } from '@/lib/rbac'
```

Replace the `NavItem` type:

```ts
export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  requiredRole?: RoleType
  items?: { title: string; url: string }[]
}
```

Add `requiredRole: 'ADMIN'` to every admin-only entry. Replace the four nav arrays with:

```ts
export const dashboardNavItems: NavItem[] = [
  {
    title: 'Analytics Dashboard',
    url: appPaths.dashboards.analytics.href,
    icon: BarChart2Icon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'CRM Dashboard',
    url: appPaths.dashboards.crm.href,
    icon: TrendingUpIcon,
    requiredRole: 'ADMIN',
  },
]

export const appsNavItems: NavItem[] = [
  {
    title: 'Articles',
    url: appPaths.articles.href,
    icon: FileTextIcon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'Chat',
    url: appPaths.apps.chat.href,
    icon: MessageSquareIcon,
    requiredRole: 'ADMIN',
  },
]

export const pagesNavItems: NavItem[] = [
  {
    title: 'Tables',
    url: appPaths.users.href,
    icon: TableIcon,
    requiredRole: 'ADMIN',
    items: [
      { title: 'Data Table', url: appPaths.users.href },
      { title: 'Filterable Table', url: appPaths.loginLogs.href },
      { title: 'Sortable Table', url: appPaths.auditLogs.href },
    ],
  },
  {
    title: 'Forms',
    url: appPaths.settings.general.href,
    icon: ClipboardPenIcon,
    items: [
      { title: 'Settings Form', url: appPaths.settings.general.href },
      { title: 'Session Manager', url: appPaths.settings.sessions.href },
      { title: 'File Upload', url: appPaths.settings.uploadDemo.href },
    ],
  },
  {
    title: '404',
    url: appPaths.pages.notFound.href,
    icon: AlertCircleIcon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'Error',
    url: appPaths.pages.error.href,
    icon: AlertCircleIcon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'Coming Soon',
    url: appPaths.pages.comingSoon.href,
    icon: TimerIcon,
    requiredRole: 'ADMIN',
  },
]

export const managementNavItems: NavItem[] = [
  {
    title: 'Roles',
    url: appPaths.roles.href,
    icon: ShieldCheckIcon,
    requiredRole: 'ADMIN',
  },
]
```

(The `Forms` entry intentionally has no `requiredRole` — Settings stays visible to any authenticated user per the overview design.)

- [ ] **Step 2: Replace sidebar filter logic**

Edit `apps/admin-shadcn/src/components/app-sidebar/index.tsx`.

Replace the imports block (currently imports `appPaths`) with:

```ts
'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { useUser } from '@/components/user-provider'
import {
  dashboardNavItems,
  appsNavItems,
  pagesNavItems,
  managementNavItems,
} from '@/config/app-paths'
import { hasRequiredRole } from '@/lib/rbac'

import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

import type { NavItem } from '@/config/app-paths'
import type { RoleType } from '@/lib/rbac'
```

Delete the `ADMIN_ONLY_URLS` constant and the `filterByRole` function.

Add the new filter helper just above `AppSidebar`:

```ts
function visibleItems(items: NavItem[], userRole: RoleType | null): NavItem[] {
  return items.filter(
    (item) => !item.requiredRole || hasRequiredRole(userRole, item.requiredRole),
  )
}
```

Replace the body of `AppSidebar` so it uses `visibleItems` for every nav group and no longer tracks `isAdmin`:

```tsx
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const storedUser = useUser()
  const pathname = usePathname()

  const userRole = storedUser?.role ?? null

  function withActive(items: NavItem[]): NavItem[] {
    return items.map((item) => ({
      ...item,
      isActive:
        pathname === item.url ||
        pathname.startsWith(item.url + '/') ||
        item.items?.some((sub) => pathname === sub.url),
      items: item.items?.map((sub) => ({
        ...sub,
        isActive: pathname === sub.url,
      })),
    }))
  }

  const user = storedUser
    ? {
        name: storedUser.email.split('@')[0] ?? storedUser.email,
        email: storedUser.email,
        avatar: '',
      }
    : { name: 'User', email: '', avatar: '' }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Dashboards" items={withActive(visibleItems(dashboardNavItems, userRole))} />
        <NavMain label="Apps" items={withActive(visibleItems(appsNavItems, userRole))} />
        <NavMain label="Pages" items={withActive(visibleItems(pagesNavItems, userRole))} />
        <NavMain label="Management" items={withActive(visibleItems(managementNavItems, userRole))} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
```

Leave the `teams` array as-is. (`NavMain` is expected to handle empty arrays gracefully — verify in Step 3.)

- [ ] **Step 3: Verify `NavMain` handles empty arrays**

```bash
grep -n 'items' apps/admin-shadcn/src/components/app-sidebar/nav-main.tsx
```

Read the file and confirm it renders nothing (or just the label) when `items` is `[]`. If it unconditionally renders a wrapper even for empty items, adjust the sidebar to skip the group instead:

```tsx
{visibleItems(dashboardNavItems, userRole).length > 0 && (
  <NavMain label="Dashboards" items={withActive(visibleItems(dashboardNavItems, userRole))} />
)}
```

Apply the same pattern to the other three `NavMain` calls if needed. Only make this change if `NavMain` doesn't already handle empty input.

- [ ] **Step 4: Typecheck**

```bash
pnpm --filter admin-shadcn typecheck
```

Expected: no errors. If errors remain from Task 2's type tightening (other files still treating `role` as `string`), they're out of scope for the RBAC infrastructure and should be listed now, not fixed. These belong to later sub-designs (user-management, login-logs, etc.).

- [ ] **Step 5: Run all tests**

```bash
pnpm --filter admin-shadcn test
```

Expected: all tests pass, including the new rbac/hook/component tests from Tasks 1–4.

- [ ] **Step 6: Commit**

```bash
git add apps/admin-shadcn/src/config/app-paths.ts apps/admin-shadcn/src/components/app-sidebar/index.tsx
git commit -m "feat(rbac): data-driven sidebar filter via NavItem.requiredRole"
```

---

## Task 8: Manual Smoke Test

This is verification, not code.

- [ ] **Step 1: Reset and seed the database**

```bash
docker exec -e PGPASSWORD=postgres postgres psql -U postgres -d nestjs-boilerplate -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm --filter @workspace/database db:push
pnpm --filter @workspace/database db:seed
```

Expected output ends with `admin@example.com (role: ADMIN)` and `user@example.com (role: USER)` created.

- [ ] **Step 2: Start API and admin in two terminals**

Terminal A: `pnpm --filter api dev`
Terminal B: `pnpm --filter admin-shadcn dev`

- [ ] **Step 3: ADMIN smoke test**

Log in at `http://localhost:8080` as `admin@example.com` / `12345678`.

Check:
- Sidebar shows Dashboards, Apps, Pages (all three Tables sub-items), Management
- Navigating to `/dashboards/analytics`, `/users`, `/roles`, `/login-logs`, `/audit-logs` all render normally
- Log out.

- [ ] **Step 4: USER smoke test**

Log in as `user@example.com` / `12345678`.

Check:
- Sidebar shows only the `Forms` group under Pages (Settings entries)
- Visiting `/users` in the URL bar shows the Next.js 404 page
- Visiting `/dashboards/analytics` shows the 404 page
- Visiting `/settings/general` works

- [ ] **Step 5: Record findings**

If any of the above deviates, file the discrepancy and fix in a follow-up before declaring the task complete. If all pass, commit nothing — this task produces no code, only verification.

---

## Done-Definition

- All seven code tasks' commits are on the branch
- `pnpm --filter admin-shadcn test` passes (including 18 new tests across rbac/hook/component specs)
- `pnpm --filter admin-shadcn typecheck` passes
- Manual smoke test (Task 8) passes

## Out of Scope

Fixed elsewhere (not in this plan):
- Migrating call sites of the old `StoredUser.role: string | null` in feature pages (`features/user-management`, `features/roles`, etc.) — each feature's redesign handles its own fallout
- Deleting the `Roles` feature page (overview says it's folded into user management, but that's the user-management sub-design's job)
- Profile/My-Activity/My-Login-Logs page stubs — the USER self-service sub-design owns these
- Dashboard redesign, audit-log visualizations, etc.
