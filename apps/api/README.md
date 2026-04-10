# api

> NestJS backend API with modular layered architecture (DDD + anemic model hybrid). Enterprise-grade skeleton for auth, audit logging, user management, file upload, and scheduled tasks.

## Tech Stack

| Category  | Technology                                           |
| --------- | ---------------------------------------------------- |
| Framework | NestJS 11 + TypeScript 5                             |
| Database  | PostgreSQL · Drizzle ORM (via `@workspace/database`) |
| Auth      | JWT · Passport · OAuth2 (Google / GitHub)            |
| Cache     | Redis · cache-manager · Keyv                         |
| Docs      | Swagger + Scalar (available at `/docs`)              |
| Logging   | nestjs-pino · pino-http                              |
| Testing   | Vitest · @nestjs/testing · Supertest                 |

## Quick Start

```bash
# Start infrastructure (PostgreSQL + Redis)
docker compose -f docker/docker-compose.yml up -d

# Push database schema (first time or after schema changes)
pnpm --filter @workspace/database db:push

# Start dev server with hot reload (port 3000)
pnpm dev
```

## Commands

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Start dev server with hot reload |
| `pnpm test`      | Run unit tests                   |
| `pnpm test:e2e`  | Run E2E tests                    |
| `pnpm test:cov`  | Run tests with coverage report   |
| `pnpm typecheck` | Type-check without emitting      |
| `pnpm lint:fix`  | Lint and auto-fix                |
| `pnpm build`     | Production build                 |

## Architecture

Dependency direction is strictly one-way (no cycles):

```
presentation/ → application/services/ → application/ports/ ← infrastructure/
                      ↓
                   domain/  (only for complex business scenarios)
```

```
src/
  ├── modules/{context}/
  │   ├── domain/              # Only for complex scenarios — zero external deps
  │   │   ├── aggregates/
  │   │   ├── entities/
  │   │   ├── value-objects/
  │   │   └── events/
  │   ├── application/
  │   │   ├── ports/           # Repository interface definitions
  │   │   └── services/
  │   ├── infrastructure/
  │   │   └── repositories/    # Implements port interfaces via Drizzle
  │   ├── presentation/
  │   │   ├── controllers/
  │   │   └── dtos/
  │   └── {context}.module.ts
  │
  ├── shared-kernel/
  │   ├── domain/              # BaseEntity, Value Object base classes
  │   └── infrastructure/      # DrizzleProvider, pagination DTOs, audit types
  │
  └── app/                     # Cross-cutting concerns (no business logic)
      ├── config/              # CLS, security, Swagger, validation config
      ├── filters/             # Global exception filters (RFC 9457)
      ├── interceptors/        # Request ID, Link header, timeout, transform
      ├── logger/              # Pino configuration
      ├── middleware/          # ETag, etc.
      └── health/              # Drizzle / Redis health checks
```

## Modules

| Module            | Pattern           | Description                                                   |
| ----------------- | ----------------- | ------------------------------------------------------------- |
| `auth`            | Anemic + Strategy | JWT login/register/refresh/session + OAuth (Google/GitHub)    |
| `user-management` | Anemic            | User list, ban/unban                                          |
| `profile`         | Anemic            | Current user profile view and update                          |
| `audit-log`       | Anemic            | Audit log query                                               |
| `dashboard`       | Anemic            | Stats aggregation                                             |
| `upload`          | Anemic            | File upload — Multer diskStorage, 10 MB limit, image/\* + PDF |
| `cache`           | Anemic            | Redis cache service wrapper                                   |
| `scheduled-tasks` | Anemic            | @nestjs/schedule examples (cron/interval/timeout)             |
| `todo`            | Anemic            | Minimal CRUD reference implementation                         |
| `article`         | Rich DDD          | Aggregate root + domain events (DDD reference)                |
| `order`           | Rich DDD          | Advanced features: idempotency, optimistic lock, async, bulk  |

## Error Handling

All errors are converted to [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457) format:

```json
{
  "type": "https://example.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User with id 123 does not exist",
  "instance": "/api/users/123",
  "request_id": "abc-123",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

Global filter execution order (reverse registration order):

```
AllExceptionsFilter → ProblemDetailsFilter → ThrottlerExceptionFilter
```

## Key Conventions

- **Imports**: always use `@/*` absolute path alias
- **Service layer**: never inject Drizzle directly — always go through a Repository Port
- **Controllers**: HTTP concerns only, no business logic
- **Simple CRUD**: use anemic model by default, do not force DDD
- **Cross-module**: communicate via domain events or shared-kernel; never import internal implementations directly
- **No**: `any`, `eslint-disable`, `@ts-ignore`, double type assertions

## Reference Modules

| Module             | Use to learn                                                |
| ------------------ | ----------------------------------------------------------- |
| `modules/todo/`    | Minimal anemic CRUD                                         |
| `modules/article/` | DDD aggregate root + domain events                          |
| `modules/order/`   | Idempotency, optimistic locking, async processing, bulk ops |
