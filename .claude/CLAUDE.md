# NestJS Boilerplate

Enterprise SaaS admin skeleton with built-in auth, authorization, auditing, and user management, plus DDD and advanced HTTP feature showcases.

> **Constitution**: `.claude/rules/constitution.md` — all rules in this repo must comply with it.

## Packages

- `apps/api` — NestJS API; DDD layered architecture showcase
- `apps/admin-shadcn` — Next.js admin panel (App Router + RSC)
- `packages/database` (`@workspace/database`) — Drizzle ORM schemas and migrations
- `packages/api-types` (`@workspace/api-types`) — API types generated via openapi-typescript
- `packages/ui` (`@workspace/ui`) — shared UI components built on `@base-ui/react`
- `packages/icons` (`@workspace/icons`) — shared icon set

Per-package rules live in `.claude/rules/` (`api.md`, `admin-shadcn.md`, `database.md`, `api-test.md`) and load automatically via `paths:` matching.

## Prerequisites

```bash
# Start local PostgreSQL + Redis
docker compose -f docker/docker-compose.yml up -d
```

## Monorepo Commands

```bash
pnpm install        # Install all dependencies
turbo build         # Build all packages
turbo test          # Run all tests
turbo lint          # Lint
turbo typecheck     # Type check
```

## Running Apps

```bash
pnpm --filter api dev              # API on port 3000
pnpm --filter admin-shadcn dev     # Admin panel on port 8080
```

## Development Workflows

### Adding a feature

1. Identify the affected packages
2. Make changes within those packages
3. If schemas change, rebuild the database package before downstream work: `pnpm --filter @workspace/database build`
4. From repo root: `turbo test && turbo typecheck`

### Front-back integration

Regenerate API types after backend API changes. The API server must be running on port 3000 first:

```bash
# Terminal 1
pnpm --filter api dev
# Terminal 2
pnpm --filter @workspace/api-types api:gen
```

## Cross-Package Rules

- Inter-package dependencies declared via the `workspace:*` protocol
- `@workspace/ui` components are built on `@base-ui/react` and do not support Radix-style `asChild`:
  - `DropdownMenuTrigger` uses the `render` prop
  - `Button` is composed via style anchor
- API types are generated; never hand-written
- Components under `packages/ui` are managed via `shadcn cli`, not edited manually

## Git Workflow

Before solving any problem, invoke the `gitflow-commit` skill to review the git workflow and decide whether a branch is needed.

All comments, commit messages, and content go in English.
