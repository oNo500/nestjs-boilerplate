# NestJS Boilerplate

[![CI](https://github.com/oNo500/nestjs-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/oNo500/nestjs-boilerplate/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-22-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10-orange)](https://pnpm.io)
[![Claude Code](https://img.shields.io/badge/Claude_Code-ready-555?logo=claude)](https://docs.claude.com/en/docs/claude-code)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

NestJS monorepo — DDD backend, Drizzle ORM + PostgreSQL, JWT/OAuth2, Next.js App Router admin frontend.

> [!NOTE]
> Looking for the Ant Design Pro integration? It has been archived due to maintenance cost. See the [`archive/admin-antd`](https://github.com/oNo500/nestjs-boilerplate/tree/archive/admin-antd) branch for the last working snapshot.

## Claude Code Ready

The `.claude/` directory encodes architectural boundaries, testing rules, and package conventions, so [Claude Code](https://docs.claude.com/en/docs/claude-code) generates code consistent with the project without having to re-establish context each session.

## Workspace

- **`api`** (`apps/api`, :3000) — NestJS backend, DDD, Drizzle ORM, Passport
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
turbo format          # auto-fix formatting (oxfmt)
turbo format:check    # CI formatting check
```

## Code Quality

Linting and formatting are powered by [oxlint](https://oxc.rs/docs/guide/usage/linter) + [oxfmt](https://oxc.rs/docs/guide/usage/formatter) via [`@infra-x/code-quality`](https://github.com/oNo500/infra-code/tree/master/packages/code-quality) presets. Each package has its own `oxlint.config.ts` and `oxfmt.config.ts` with framework-specific rules.

- **Root** — shared baseline (base, unicorn, depend)
- **api** — NestJS boundaries, Drizzle, Node.js, Vitest
- **admin-shadcn** — React, Next.js, Vitest, Tailwind CSS class sorting
- **database** — Drizzle, Node.js
- **ui** — React, Tailwind CSS class sorting
- **icons** — React

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
