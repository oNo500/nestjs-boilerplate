---
paths:
  - apps/api/**
---

# API Rules (NestJS)

Architectural rules for the NestJS API: directory structure, layer responsibilities, context boundaries, and inter-context communication.

> **Terminology**
> - `context` — a directory under `modules/`; the unit of business boundary
> - `Module` — the NestJS `@Module()` decorator; implementation mechanism, not a boundary

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL · Drizzle ORM (via `@workspace/database`)
- **Auth**: JWT + Passport · OAuth2 (Google / GitHub)
- **Cache**: Redis · cache-manager
- **Testing**: Vitest · @nestjs/testing · Supertest
- **Logging**: nestjs-pino · pino-http
- **HTTP**: class-validator · class-transformer · @nestjs/swagger · Scalar

## Architecture

### Dependency direction (single-directional, acyclic)

```
presentation/ → application/services/ → application/ports/ ← infrastructure/
                      ↓
                   domain/ (only in complex cases)
```

### Directory layout

```
src/
├── app/                          # Cross-cutting infrastructure, no business semantics
│   ├── config/                   # Env vars, Swagger, security config
│   ├── database/                 # DrizzleModule
│   ├── events/                   # DomainEventsModule
│   ├── filters/                  # Global exception filters
│   ├── interceptors/             # Request/response interceptors
│   ├── middleware/               # HTTP middleware
│   └── logger/                   # Logger config
│
├── modules/                      # Bounded contexts; never import each other
│   └── {context}/                # One bounded context per directory
│
└── shared-kernel/                # Cross-context contracts only
    ├── domain/
    │   ├── base-aggregate-root.ts
    │   ├── events/               # Base domain event classes
    │   └── value-objects/        # Cross-context value objects (Money, Address, etc.)
    ├── application/
    │   └── ports/                # Cross-context port interfaces
    └── infrastructure/
        ├── dtos/                 # Pagination, generic response DTOs
        ├── decorators/           # Generic decorators
        ├── enums/                # Global error codes
        └── types/                # Cross-context pure TS types
```

### Layer responsibilities

| Layer | Responsibility | Must not |
|---|---|---|
| `app/` | Framework config, cross-cutting concerns | Business logic; import `modules/` |
| `presentation/` | Accept requests, validate, call Service, return response | Business logic; access DB directly |
| `application/services/` | Orchestrate business flows, call ports | Inject DB client directly |
| `domain/` | Business rules, state transitions, domain events | Depend on external libraries |
| `infrastructure/` | Implement port interfaces, DB queries | Business decisions |
| `shared-kernel/` | Cross-context contracts, technical base classes | Business rules, runtime state, concrete implementations |

### Context internal structure

```
modules/{context}/
├── domain/                      # Only for complex cases; zero external dependencies
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── enums/                   # `as const` pattern
│   ├── events/
│   ├── services/                # Domain services (pure business logic)
│   └── factories/               # Optional
├── application/
│   ├── ports/                   # Interface definitions, e.g. {context}.repository.port.ts
│   ├── services/                # Single file by default; split by scenario when > 10 methods
│   └── listeners/               # Domain / integration event listeners
├── infrastructure/
│   ├── repositories/            # Implement port interfaces
│   └── adapters/                # External system adapters (third-party APIs, message queues)
├── presentation/
│   ├── controllers/
│   └── dtos/
└── {context}.module.ts
```

## Context Boundaries

### Partition rules

**Fold into existing context** — all conditions must hold:

1. **Same aggregate root**: the new feature's core operation target is an aggregate root already owned by this context
2. **No new domain concept**: no new entity or value object required, or the new concept is strictly subordinate to an existing aggregate root
3. **Responsibility unchanged**: describe the context's responsibility in one sentence; adding the feature does not change that sentence

**Create new context** — any one condition triggers a new context:

1. **Independent aggregate root**: owns its own aggregate root whose lifecycle is not bound to any existing one
2. **Responsibility overflow**: after folding in, the one-sentence responsibility no longer holds
3. **ID-only coupling with existing contexts**: only IDs are exchanged, no domain objects shared

**Ambiguous cases** — decision procedure:

1. Write down the target context's current responsibility in one sentence
2. Fold in the new feature and rewrite the responsibility
3. Sentence grows or contains "and" joining heterogeneous concepts → new context
4. Sentence unchanged → fold in

Example:

```
auth current: manages user login, session, and OAuth
with "notification" folded in: manages login, session, OAuth, and messaging ← "and" joins heterogeneous concepts
→ create a new notification context
```

### Inter-context communication

Contexts must not import each other. Only two legal channels:

**Port contract** (synchronous, needs return value) — one context queries another's data:

- Interface defined in `shared-kernel/application/ports/`
- Implementation lives in the owning context and is exported via `@Global()` token
- Consumers inject via `@Inject(TOKEN)`, never import the implementation

**Event contract** (asynchronous, side effect) — one context's action triggers another's reaction:

- Event class defined under the publisher's `domain/events/`
- Publisher emits without knowing consumers
- Consumers declare `@OnEvent()` listeners under their own `application/listeners/`

Decision table:

```
Needs return value (sync query)       →  Port contract
Triggers side effect (async reaction) →  Event contract
Multiple contexts share one concept   →  Extract as a shared subdomain (its own context)
Bidirectional dependency appears      →  Boundaries are wrong; merge then re-split
```

### Shared subdomains

When a business concept is depended on by ≥ 3 contexts, it belongs to no single context and should be extracted as an independent shared subdomain.

**Test**: remove the context that currently owns the concept; do other contexts still need it? If yes, it is a shared subdomain.

Example: `User` identity data is used by auth, order, analytics, and more. It does not belong to auth and exists as an independent `identity` context.

## Shared Kernel

### Admission rules

Content placed in `shared-kernel/` must satisfy all:

1. **Rule of Three**: used by ≥ 3 contexts in the same way
2. **Zero business semantics**: no business rules; no branching by context
3. **Contracts only**: interfaces, base classes, generic DTOs — no concrete implementations

### `@Global()` scope

Only the following contexts may use `@Global()`:

| Context | Token | Rationale |
|---|---|---|
| `DrizzleModule` (app/) | `DB_TOKEN` | Every context needs DB |
| `cache` | `CACHE_PORT` | Infrastructure capability, multi-context use |
| `audit-log` | `AUDIT_LOGGER` | Cross-cutting concern, needed on every write |
| `DomainEventsModule` (app/) | — | Framework-level event system |

- Every `@Global()` module imported exactly once, in `AppModule`
- Guards defined under `modules/auth/presentation/guards/`, registered globally in `AppModule` via the `APP_GUARD` token, and consumed via `@UseGuards()` without importing `auth`

```typescript
// app.module.ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
]
```

## Database Workflow

**Golden rule**: Services never inject the database client directly; all DB access goes through a Repository port.

```bash
# 1. Edit packages/database/src/schemas/
# 2. Rebuild the database package
pnpm --filter @workspace/database build
# 3. Push schema changes (dev)
pnpm --filter @workspace/database db:push
# 4. Or generate migrations (prod)
pnpm --filter @workspace/database db:generate
```

## Conventions

| Scope | Rule | Example |
|---|---|---|
| File / directory | kebab-case | `user-profile.dto.ts` |
| Class / interface | PascalCase | `UserService`, `UserRepository` |
| Function / variable | camelCase | `findById`, `isActive` |
| Constant | UPPER_SNAKE_CASE | `USER_REPOSITORY` |

- **Absolute imports**: use the `@/*` path alias
- **Private fields**: use the `#` syntax, not the `_` prefix

## Prohibited

- Direct import between contexts
- `app/` importing `modules/`
- Services injecting the DB client directly (must go through a Repository port)
- Controllers containing business logic
- `domain/` depending on external libraries
- Creating a `domain/` layer for simple CRUD
- `@Global()` on non-infrastructure contexts
- Concrete implementations inside `shared-kernel/`
- A Service exceeding 10 methods without being split
- Hand-writing the `RoleType` union (derive from `UserDatabase['role']` — the `user_role` pgEnum is the source of truth)
