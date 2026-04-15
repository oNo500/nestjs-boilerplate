# Admin Frontend Redesign — Overview

> **Status**: design
> **Date**: 2026-04-15
> **Scope**: `apps/admin-shadcn` — complete rethink, not incremental upgrade

## Why

The admin frontend grew organically and has accumulated structural problems:

- RBAC is scattered (string-comparison hardcoded, sidebar whitelist diverges from backend guards, no single-source types)
- All guarded pages use `@Roles('ADMIN')` — role hierarchy exists but is never exercised
- Existing dashboard / log pages are decorative, not information-dense
- Two roles (ADMIN, USER) defined but USER has no reason to log in

Goal: redesign the admin frontend as a proper **boilerplate showcase** — demonstrate how a real SaaS admin panel handles dual-role access, auditable actions, and data visualization, using patterns `fork`ers can directly copy.

## Target Users (positioning)

Combined B + C from brainstorming:

- **Primary purpose**: demo / boilerplate. Fork this repo and replace demo modules with real business modules.
- **Demonstrates**: mixed-role scenario. Both ADMIN (operations) and USER (end user looking at their own data) log in through the same entry point.

Two seeded accounts drive the story:

- `admin@example.com` — sees everything (user management, global logs, system metrics)
- `user@example.com` — sees only personal data (profile, own activity history)

## Role Boundaries

Decision: **superset URLs, dedicated `/my-*` zone for personal views** (option C from brainstorming).

- **ADMIN-only paths**: `/dashboard`, `/users`, `/roles`, `/audit-logs`, `/login-logs`, system pages, business demo pages
- **Any-authenticated paths** (`/my-*` + profile/settings): `/profile`, `/my-activity`, `/my-login-logs`, `/settings/*`
- Same URL never returns different content based on role. If two roles need the "same" data at different scopes, expose two endpoints (`GET /login-logs` ADMIN + `GET /login-logs/me` any user) and two frontend pages.

Post-login redirect:
- ADMIN → `/dashboard`
- USER → `/profile`

## Information Architecture

Sidebar is grouped by **business domain** (option A from brainstorming). Menu items are filtered by role via a `requiredRole` field on each nav item, not by URL allowlists.

**ADMIN sees:**
- Dashboard
- Identity — Users, Roles
- Audit — Audit Logs, Login Logs
- System — Health, Scheduled Tasks, Cache (deferred to later specs)
- Business Demo — Articles, Orders, Todos (existing demo modules, kept to show feature slices)
- My — Profile, My Activity, My Login Logs, Settings

**USER sees:**
- My — Profile, My Activity, My Login Logs, Settings

## Tech Stack

All already installed; no new dependencies needed.

- **Data fetching**: `openapi-react-query` (`$api.useQuery`) + `@tanstack/react-query` — continue existing pattern
- **Tables**: TanStack Table via shadcn DataTable — continue existing pattern
- **Charts**: shadcn `chart` (thin wrapper over `recharts`) — already installed
- **Types**: `@workspace/api-types` (OpenAPI-generated) — `RoleType` derived from `UserResponseDto['role']`
- **RBAC runtime**: hand-written `lib/rbac.ts` with `ROLES` constant + `hasRequiredRole` (< 20 lines, comment pointing at backend `role.vo.ts`)

## Dashboard (ADMIN only)

Single screen covering three showcase tracks — growth, security, audit. Chosen over single-theme layouts so forkers see that all three data sources wire up cleanly.

**Number cards (4):**
- Total users
- Today's logins
- Today's audit entries
- Login failure rate (today)

**Charts (3):**
- **Line** — new users (last 30 days)
- **Stacked bar** — logins success vs failure (last 7 days)
- **Area** — audit entries trend (last 30 days)

USER has no dashboard. USER's default landing page is `/profile`.

## Sub-Designs (to follow this overview)

This overview defines the skeleton. Each of the following gets its own design doc when we get to it:

1. **RBAC infrastructure** — `lib/rbac.ts`, `useCurrentUser`, `useHasRole`, `<RequireRole>`, `(protected)` layout guard, nav item role filter
2. **Dashboard page** — layout, card queries, chart components, empty/loading states
3. **Audit & login logs** — list pages, filters, `/my-*` variants, pagination
4. **User management & roles** — unified page for listing, role assignment, ban/unban
5. **USER self-service area** — profile, activity history, own login logs, preferences, password/security

System pages (health, scheduled-tasks, cache) and business demo pages (articles, orders, todos) are out of scope for this redesign — they stay as-is or get separate minor cleanups.

## What Gets Deleted

The redesign is allowed to drop existing pages that don't fit the new design:

- Current `analytics-dashboard` feature — replaced by new Dashboard
- Current `roles` page — folded into unified user management page
- Any other feature where the new sub-design clearly supersedes the old implementation

Specific deletions are listed in each sub-design doc, not here.

## Non-Goals

- Multi-tenancy / organizations (not in scope; if added later, fits under a new `organization` context)
- Fine-grained permissions (still role-based; if permission model is needed later, the `lib/rbac.ts` file is the extension point)
- Internationalization of role labels beyond a simple lookup table (labels are English for now)
- Mobile-first layout (desktop-primary, responsive-as-afforded)

## Out of Scope for This Overview

Concrete hook signatures, component props, query shapes, error handling, test strategy — all belong in the sub-designs. This doc only fixes the skeleton.

## Open Questions

None at time of writing. Sub-designs will surface new ones.
