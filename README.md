# NestJS Boilerplate

[![CI](https://github.com/oNo500/nestjs-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/oNo500/nestjs-boilerplate/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-22-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10-orange)](https://pnpm.io)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

NestJS monorepo — DDD backend, Drizzle ORM + PostgreSQL, JWT/OAuth2, two admin frontends (Ant Design Pro, Next.js App Router).

## Workspace

- **`api`** (`apps/api`, :3000) — NestJS backend, DDD, Drizzle ORM, Passport
- **`admin-antd`** (`apps/admin-antd`, :8081) — Feature reference panel, Ant Design Pro, i18n
- **`admin-shadcn`** (`apps/admin-shadcn`, :8080) — Tech demo panel, Next.js App Router, shadcn/ui
- **`@workspace/database`** (`packages/database`) — Schema definitions & migrations, Drizzle ORM
- **`@workspace/api-types`** (`packages/api-types`) — Shared OpenAPI type definitions, openapi-typescript
- **`@workspace/ui`** (`packages/ui`) — Shared UI component library, @base-ui/react
- **`@workspace/icons`** (`packages/icons`) — Shared icon set

## Quick Start

> [!NOTE]
> `pnpm install` automatically copies `.env.example` → `.env` for all packages via the `prepare` script. Run `pnpm setup:env` to force-reset them.

> [!IMPORTANT]
> PostgreSQL and Redis must be running before starting the API. Use the provided Docker Compose file.

```bash
pnpm install
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

> [!WARNING]
> API types are auto-generated from the OpenAPI spec. Never hand-write them.

```bash
# After any backend endpoint change (API must be running on :3000)
pnpm --filter @workspace/api-types api:gen
```
