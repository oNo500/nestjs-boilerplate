# NestJS Boilerplate

> Enterprise-grade SaaS admin skeleton with authentication, authorization, audit logging, user management, and architectural patterns (DDD, advanced HTTP features).

## Workspace

| App / Package | Path | Port | Role | Key Tech |
|---|---|---|---|---|
| `api` | `apps/api` | 3000 | NestJS backend API | NestJS, Drizzle ORM, Passport, DDD |
| `admin-antd` | `apps/admin-antd` | 8081 | Feature reference panel | React, Ant Design Pro, i18n, ProTable |
| `admin-shadcn` | `apps/admin-shadcn` | 8080 | Tech demo panel | Next.js App Router, shadcn/ui, RSC |
| `@workspace/database` | `packages/database` | — | Schema definitions & migrations | Drizzle ORM, PostgreSQL |
| `@workspace/ui` | `packages/ui` | — | Shared UI component library | @base-ui/react |
| `@workspace/icons` | `packages/icons` | — | Shared icon set | — |

## Prerequisites

- **Node.js** v20+
- **pnpm** v10+
- **Docker** (for local PostgreSQL + Redis)

## Quick Start

```bash
# 1. Install all dependencies
pnpm install

# 2. Copy environment files and fill in apps/api/.env
pnpm setup:env

# 3. Start infrastructure (PostgreSQL on 5432, Redis on 6379)
docker compose -f docker/docker-compose.yml up -d

# 4. Start all services concurrently
pnpm dev
```

## Running Services Individually

```bash
# Backend API (port 3000)
pnpm --filter api dev

# Feature reference panel — admin-antd (port 8081)
pnpm --filter admin-antd dev

# Tech demo panel — admin-shadcn (port 8080)
pnpm --filter admin-shadcn dev
```

## Common Commands

```bash
turbo build       # Build all packages
turbo test        # Run all tests
turbo lint        # Lint all packages
turbo typecheck   # Type-check all packages
```

## Workflows

### Update Database Schema

After modifying schema files in `packages/database/src/schemas/`:

```bash
# 1. Rebuild the database package so downstream packages pick up the new types
pnpm --filter @workspace/database build

# 2a. Development — push schema directly (no migration file)
pnpm --filter @workspace/database db:push

# 2b. Production — generate a migration file, then apply it
pnpm --filter @workspace/database db:generate
pnpm --filter @workspace/database db:migrate

# (Optional) Inspect the database in a browser UI
pnpm --filter @workspace/database db:studio
```

### Regenerate API Types (after backend changes)

The frontend packages use `openapi-typescript` to generate types from the running API. After changing any backend endpoint:

```bash
# 1. Make sure the API dev server is running (port 3000)
pnpm --filter api dev

# 2. Regenerate types for each frontend
pnpm --filter admin-shadcn api:gen
pnpm --filter admin-antd api:gen
```

> **Note:** Never hand-write API types in the frontend packages. Always regenerate from the OpenAPI spec.

## Architecture Overview

### `apps/api`
NestJS backend following Domain-Driven Design. Layers: `domain` → `application` → `infrastructure` → `presentation`. Includes auth (JWT + OAuth), user management, audit logging, file upload, and scheduled tasks.

### `apps/admin-antd`
Functional reference panel demonstrating real-world features: user management, role management, audit log viewer, i18n (zh/en), and Ant Design Pro's ProTable with server-side pagination.

### `apps/admin-shadcn`
Tech demo panel focused on modern Next.js patterns: App Router, React Server Components, authentication flow (login/logout/OAuth callback), and a dashboard with data visualization.

### `packages/database`
Single source of truth for all database schemas. Built with Drizzle ORM. Must be rebuilt (`build`) after any schema change before downstream packages can see updated types.

### `packages/ui`
Shared headless component library built on `@base-ui/react`. Components are managed via the shadcn CLI — do not edit generated files directly. Does **not** support Radix-style `asChild`; use `render` prop on `DropdownMenuTrigger` instead.

## Docker Infrastructure

```yaml
# docker/docker-compose.yml
PostgreSQL:  localhost:5432
Redis:       localhost:6379
```

Start with:

```bash
docker compose -f docker/docker-compose.yml up -d
```
