# NestJS Boilerplate

[![CI](https://github.com/oNo500/nestjs-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/oNo500/nestjs-boilerplate/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-22-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10-orange)](https://pnpm.io)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**A production-ready full-stack NestJS + Next.js boilerplate.**

A complete monorepo with the cross-cutting concerns a real SaaS needs, plus a typed contract from PostgreSQL all the way to React. Start with plain CRUD; graduate a context to full DDD only when it earns it.

## Features

- **Auth & RBAC** — JWT + OAuth (Google / GitHub), role-based access control.
- **Admin frontend, batteries included** — Next.js App Router, TanStack Query with type-safe hooks, React Hook Form + Zod, role-aware components for UI-level RBAC.
- **Durable writes & audit** — idempotency keys, optimistic locking via ETag, and domain-event-driven audit logging.
- **Observability** — standardized error responses (RFC 9457 problem details), structured logging with PII redaction, request-ID correlation.
- **End-to-end typed** — Drizzle drives database types; OpenAPI drives frontend types. Interactive API docs at `/docs`.
- **Ready for AI assistants** — architectural rules under [`.claude/rules/`](./.claude/rules/) load automatically into Claude Code, Cursor, and similar tools. The same files work as onboarding docs for human contributors.
- **Modern toolchain** — NestJS 11 · Next.js 16 · Drizzle ORM · shadcn/ui on Base UI · oxlint + oxfmt · Turborepo · pnpm.

> [!NOTE]
> Looking for the Ant Design Pro integration? It has been archived due to maintenance cost. See the [`archive/admin-antd`](https://github.com/oNo500/nestjs-boilerplate/tree/archive/admin-antd) branch for the last working snapshot.

## Workspace

- **`api`** (`apps/api`, :3000) — NestJS backend, DDD, Drizzle ORM, Passport
- **`admin-shadcn`** (`apps/admin-shadcn`, :8080) — Admin panel, Next.js App Router, shadcn/ui
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

## Documentation

- [Architecture](./docs/architecture.md) — monorepo layout, DDD layering, request lifecycle
- [API Conventions](./docs/api-conventions.md) — URLs, responses, errors, auth, idempotency, optimistic locking
- [Technology Choices](./docs/technology-choices.md) — why Drizzle, Base UI, opt-in DDD, oxlint
- [Contributing](./CONTRIBUTING.md) — setup, workflows, testing, git, troubleshooting
