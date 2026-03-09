# admin-antd

> Feature reference panel in Ant Design Pro style — user management, role management, audit logs, i18n, and ProTable with server-side pagination.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + React Router 7 + Vite (SWC) |
| UI | Ant Design v6 · @ant-design/pro-components · recharts · lucide-react |
| State | Zustand (auth / locale / theme stores) |
| Data Fetching | openapi-fetch · openapi-react-query · TanStack Query v5 |
| i18n | i18next · react-i18next (zh / en) |
| API Types | openapi-typescript (auto-generated — never hand-write) |

## Quick Start

```bash
cp .env.example .env
# Ensure apps/api is running on port 3000
pnpm dev   # http://localhost:8081
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (port 8081) |
| `pnpm build` | Production build |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm api:gen` | Regenerate API types from running backend |

## Directory Structure

```
src/
├── app/
│   ├── routes/              # Route definitions — page composition only, no business logic
│   │   ├── dashboard/
│   │   ├── system/          # users, roles, audit-logs
│   │   ├── account/
│   │   ├── profile/
│   │   └── ...
│   └── ...                  # Root layout, Providers, route guards
├── features/                # Business logic organized by domain
│   └── <name>/
│       ├── api/             # API calls for this feature
│       ├── components/      # Feature-scoped components
│       ├── types/           # Feature-scoped types
│       ├── stores/          # Feature-scoped Zustand store (optional)
│       └── index.ts         # Public exports
├── components/              # Cross-feature shared components
├── hooks/                   # Cross-feature shared hooks
├── stores/                  # Global Zustand stores (locale, theme)
├── lib/
│   ├── api-client.ts        # openapi-fetch HTTP client (Bearer token, auto-refresh)
│   ├── react-query.ts       # QueryClient configuration
│   └── token.ts             # localStorage token management
├── config/
│   ├── env.ts               # Env vars (zod-validated) — import from here, never import.meta.env directly
│   ├── menu.tsx             # Menu structure (single source of truth for all routes/paths)
│   ├── i18n.ts              # i18next initialization
│   └── theme.ts             # Ant Design token theme
├── locales/
│   ├── zh/                  # Chinese translations by namespace
│   └── en/                  # English translations by namespace
└── types/
    └── openapi.d.ts         # Auto-generated — never edit manually
```

## Features

| Feature | Route prefix | Description |
|---|---|---|
| `auth` | `/login` | Login, register, logout |
| `dashboard` | `/dashboard` | Analytics charts, monitor, workplace (some are mock) |
| `users` | `/system/users` | User management with ProTable |
| `roles` | `/system/roles` | Role management |
| `audit-logs` | `/system/audit-logs` | Audit log viewer with ProTable |
| `profile` | `/profile` | Personal profile |
| `scaffold` | multiple | UI scaffold demos (form, list, result, etc.) |
| `foundation` | `/foundation` | Base components and icon showcase |

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

- **Routes**: composition only — import feature components, pass route params. No business logic in route files.
- **Menu paths**: `config/menu.tsx` → `getMenuItems()` is the single source of truth. No hardcoded path strings elsewhere.
- **Env vars**: always import from `config/env.ts` (`env`), never read `import.meta.env` directly.
- **API calls**: always use `fetchClient` from `lib/api-client.ts` for type-safe, token-aware requests.
- **i18n**: use `useTranslation('namespace')` hook; translations live in `locales/zh/<namespace>.json` and `locales/en/<namespace>.json`.
- **Feature exports**: external code imports only from `features/<name>/index.ts`, never from internal paths.
