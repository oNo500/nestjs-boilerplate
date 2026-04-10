# admin-shadcn

> Tech demo panel built on Next.js 16 App Router — showcasing authentication flow, dashboard visualization, React Server Components, and modern Next.js architecture patterns.

## Tech Stack

| Category      | Technology                                                                             |
| ------------- | -------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack) + React Compiler                                    |
| UI            | @workspace/ui (@base-ui/react) · Tailwind CSS v4 · shadcn/ui · lucide-react · recharts |
| Forms         | react-hook-form · zod · @hookform/resolvers                                            |
| Data Fetching | openapi-fetch · openapi-react-query · TanStack Query v5                                |
| Tables        | @tanstack/react-table                                                                  |
| API Types     | openapi-typescript (auto-generated — never hand-write)                                 |
| Testing       | Vitest · @testing-library/react · MSW                                                  |

## Quick Start

```bash
cp .env.example .env
# Ensure apps/api is running on port 3000
pnpm dev   # http://localhost:8080 (Turbopack)
```

## Commands

| Command          | Description                                 |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Start dev server with Turbopack (port 8080) |
| `pnpm build`     | Production build                            |
| `pnpm test`      | Run unit tests                              |
| `pnpm typecheck` | Type-check without emitting                 |
| `pnpm lint:fix`  | Lint and auto-fix                           |
| `pnpm api:gen`   | Regenerate API types from running backend   |

## Directory Structure

```
src/
├── app/                       # Next.js App Router — routing only, no business logic
│   ├── (auth)/                # Auth pages (login, register, oauth callback)
│   ├── (protected)/           # Middleware-guarded pages (require login)
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── audit-logs/
│   │   ├── login-logs/
│   │   ├── articles/
│   │   └── settings/
│   └── (example)/             # Tech demo pages
├── features/                  # Business logic organized by domain
│   └── <name>/
│       ├── components/        # Feature-scoped components (optional)
│       ├── hooks/             # Feature-scoped hooks (optional)
│       └── <entry>.tsx        # Feature entry component
├── components/                # Cross-feature shared components
│   └── app-sidebar/
├── hooks/                     # Cross-feature shared hooks
├── lib/
│   ├── api-client.ts          # Client Component HTTP client (Bearer token, auto-refresh)
│   ├── fetch-client.ts        # Server Component HTTP client (Cookie + Next.js cache tags)
│   ├── react-query.ts         # QueryClient configuration
│   └── token.ts               # localStorage token management
├── config/
│   ├── env.ts                 # Env vars (@t3-oss/env-nextjs + zod) — import from here
│   └── app-paths.ts           # Route paths (single source of truth — never hardcode strings)
└── types/
    └── openapi.d.ts           # Auto-generated — never edit manually
```

## Features

| Feature           | Route                                                            | Description                      |
| ----------------- | ---------------------------------------------------------------- | -------------------------------- |
| `auth`            | `/login` `/register` `/oauth`                                    | Login, register, OAuth callback  |
| `dashboard`       | `/dashboard`                                                     | Stats charts and visualization   |
| `user-management` | `/users`                                                         | User list, ban/unban (DataTable) |
| `audit-logs`      | `/audit-logs`                                                    | Audit log table                  |
| `login-logs`      | `/login-logs`                                                    | Login log table                  |
| `articles`        | `/articles`                                                      | Article management               |
| `settings`        | `/settings/general` `/settings/sessions` `/settings/upload-demo` | Personal settings                |
| `example`         | `/(example)/*`                                                   | Tech demo pages                  |

## Two HTTP Clients (Never Mix)

This app has two HTTP clients for different rendering contexts — using the wrong one in a given context will break auth or caching:

| Client        | File                  | Use in            | Auth mechanism                                  |
| ------------- | --------------------- | ----------------- | ----------------------------------------------- |
| `apiClient`   | `lib/api-client.ts`   | Client Components | Bearer token (auto-refresh, Promise queue lock) |
| `fetchClient` | `lib/fetch-client.ts` | Server Components | Cookie passthrough + Next.js `cache tags`       |

## Regenerate API Types

After any backend API change, resync the generated types:

```bash
# 1. Make sure the API dev server is running (port 3000)
pnpm --filter api dev

# 2. Regenerate
pnpm api:gen
```

> `src/types/openapi.d.ts` is auto-generated. Never hand-write or edit it.

## Key Conventions

- **App Router pages**: export `metadata`, `dynamic` config, and compose feature components. No JSX structure or business logic — push it down to `features/`.
- **Route paths**: always import from `config/app-paths.ts` (`appPaths`). Never hardcode path strings.
- **Env vars**: import from `config/env.ts` (`env`), never access `process.env` directly.
- **@workspace/ui**: based on `@base-ui/react`, does not support Radix-style `asChild`. Use `render` prop on `DropdownMenuTrigger`; use styled anchor for `Button` links.
- **Feature files**: no barrel `index.ts` — import directly from source files.
- **API types**: always use the typed methods on `apiClient` or `fetchClient`. Never write API types by hand.

## Testing

```bash
pnpm test           # Run all unit tests
```

- Tests are co-located with source files: `foo.tsx` + `foo.test.tsx`
- Cross-module E2E tests live in `__tests__/`
- API calls are intercepted by MSW (`src/testing/msw/`)
- Global mocks: `next/navigation` (useRouter / useSearchParams / usePathname / redirect)
