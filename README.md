# NestJS Boilerplate

NestJS monorepo — DDD backend, Drizzle ORM + PostgreSQL, JWT/OAuth2, two admin frontends (Ant Design Pro, Next.js App Router).

## Workspace

- **`api`** (`apps/api`, :3000) — NestJS backend, DDD, Drizzle ORM, Passport
- **`admin-antd`** (`apps/admin-antd`, :8081) — Feature reference panel, Ant Design Pro, i18n
- **`admin-shadcn`** (`apps/admin-shadcn`, :8080) — Tech demo panel, Next.js App Router, shadcn/ui
- **`@workspace/database`** (`packages/database`) — Schema definitions & migrations, Drizzle ORM
- **`@workspace/ui`** (`packages/ui`) — Shared UI component library, @base-ui/react
- **`@workspace/icons`** (`packages/icons`) — Shared icon set

## Quick Start

```bash
pnpm install
pnpm setup:env                                      # copy .env files
docker compose -f docker/docker-compose.yml up -d  # PostgreSQL + Redis
pnpm dev
```

## Common Commands

```bash
turbo build / test / lint / typecheck
```

## Workflows

### Update Database Schema

```bash
pnpm --filter @workspace/database build   # rebuild types
pnpm --filter @workspace/database db:push # dev: push directly
# prod: db:generate → db:migrate
```

### Regenerate API Types

```bash
# After any backend endpoint change (API must be running on :3000)
pnpm --filter @workspace/api-types api:gen
```

> Never hand-write API types — always regenerate from the OpenAPI spec.
