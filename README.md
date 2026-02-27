# NestJS Full-Stack Boilerplate

A production-ready full-stack monorepo boilerplate powered by NestJS, React, Drizzle ORM, and Turborepo.

The backend follows a modular layered architecture combining DIP, scenario-based services, and on-demand DDD — simple CRUD stays lean, complex business logic gets a proper domain model.

## Project Structure

```
├── apps/
│   ├── api/            # NestJS backend
│   └── admin-antd/     # Admin panel (React + Ant Design Pro)
├── packages/
│   ├── database/       # Drizzle schema, migrations, seed scripts
│   ├── eslint-config/  # Shared ESLint configuration
│   └── icons/          # SVG icon components (auto-generated via SVGR)
├── docker/             # Docker Compose for local infrastructure
├── pnpm-workspace.yaml
└── turbo.json
```

### API modules

```
src/
├── modules/
│   ├── auth/             # Registration, login, session management, refresh tokens
│   ├── profile/          # User profile
│   ├── user-management/  # Admin user CRUD
│   ├── article/          # Article lifecycle with domain events (draft → published → archived)
│   ├── order/            # Idempotency, optimistic locking, async jobs, bulk operations
│   ├── audit-log/        # Append-only action log
│   ├── todo/             # Minimal CRUD reference
│   └── dashboard/        # Aggregated statistics
├── shared-kernel/        # Shared infrastructure (pagination, guards, base classes)
└── app/                  # Cross-cutting concerns (filters, interceptors, config)
```

## Tech Stack

**API**
- NestJS 11, TypeScript
- PostgreSQL, Drizzle ORM
- Redis, Keyv
- JWT, Bcrypt
- Pino, nestjs-cls, Zod

**Admin panel**
- React 19, TypeScript, Vite
- Ant Design, Ant Design Pro
- Zustand, TanStack Query
- openapi-typescript

**Monorepo**: pnpm + Turborepo

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker

### 1. Clone and install

```bash
git clone https://github.com/oNo500/nestjs-boilerplate.git
cd nestjs-boilerplate
pnpm install
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/admin-antd/.env.example apps/admin-antd/.env
cp packages/database/.env.example packages/database/.env
```

Edit the `.env` files with your local configuration:

- `apps/api/.env` — set `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`
- `packages/database/.env` — set `DATABASE_URL` (used by Drizzle Kit for migrations)

### 3. Initialize and start

```bash
docker compose -f docker/docker-compose.yml up -d          # start PostgreSQL + Redis
pnpm --filter @workspace/database db:push                  # run migrations
pnpm --filter @workspace/database db:seed                  # (optional) seed data
pnpm dev
```

### Local URLs

| URL | Description |
|---|---|
| `http://localhost:3000/docs` | Scalar API documentation |
| `http://localhost:3000/swagger` | Swagger UI |
| `http://localhost:3000/health` | Health check |
| `http://localhost:5173` | Admin panel |

## Common Commands

```bash
pnpm --filter api test                                # Run API unit tests
pnpm --filter @workspace/database db:generate        # Generate migrations after schema changes
pnpm --filter @workspace/database db:push            # Apply migrations (development)
pnpm --filter @workspace/database db:migrate         # Apply migrations (production)
pnpm --filter @workspace/database db:studio          # Open Drizzle Studio
pnpm --filter admin-antd api:gen                     # Regenerate OpenAPI types (requires API running)
```

## Deployment

Auto-deployed to GCP Cloud Run via GitHub Actions. See [docs/deployment.md](./docs/deployment.md) for details.
