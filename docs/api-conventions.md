# API Conventions

The HTTP contract exposed by `apps/api`. Every rule here is enforced by code (interceptors, filters, guards, decorators), not just by convention.

- Global prefix: **`/api`** (exclusions: `/health`, `/.well-known/*`)
- API docs: [`/docs`](http://localhost:3000/docs) (Scalar) · [`/swagger`](http://localhost:3000/swagger) (Swagger UI) · [`/openapi.yaml`](http://localhost:3000/openapi.yaml)
- Error format: **RFC 9457 Problem Details** (`application/problem+json`)
- Auth: JWT Bearer token in `Authorization` header

## URLs

### Prefix and exclusions

```ts
// main.ts
app.setGlobalPrefix('api', {
  exclude: ['health', { path: '.well-known/*', method: RequestMethod.ALL }],
})
```

Everything business-facing sits under `/api`. Operational endpoints (`/health`, `/.well-known/*`) are explicitly excluded.

### Resource naming

Controllers use **plural, lowercase, kebab-case** nouns that match their context:

- `@Controller('articles')` → `/api/articles`
- `@Controller('orders')` → `/api/orders`
- `@Controller('users')` → `/api/users`
- `@Controller('audit-logs')` → `/api/audit-logs`

Sub-resources use nested paths: `POST /api/orders/:id/pay`, not `POST /api/orders/pay/:id`.

### HTTP methods

- `GET` — read, idempotent, no body
- `POST` — create or non-idempotent action (pay, cancel)
- `PATCH` — partial update
- `PUT` — full replacement (rare in this repo)
- `DELETE` — remove

### Versioning

No URL versioning. Breaking changes are managed via OpenAPI spec drift + coordinated `@workspace/api-types` regeneration. If you ever need v2, add it alongside via `@Controller({ path: 'orders', version: '2' })` — but prefer evolving in place.

## Response Envelope

Shaped by `TransformInterceptor` (`app/interceptors/transform.interceptor.ts`). Follows **Google API Design** style.

### Single resource — bare object

```http
GET /api/articles/abc-123 → 200 OK
```

```json
{
  "id": "abc-123",
  "title": "Hello",
  "createdAt": "2026-04-16T00:00:00.000Z"
}
```

### Collection — `{ object: "list", data, ... }`

Every endpoint that returns a list **must** include `object: 'list'` and a `data[]` array. The interceptor enforces this.

**Offset pagination** (default):

```http
GET /api/articles?page=1&pageSize=20 → 200 OK
```

```json
{
  "object": "list",
  "data": [...],
  "page": 1,
  "pageSize": 20,
  "total": 137,
  "hasMore": true
}
```

**Cursor pagination** (for large / append-only collections):

```http
GET /api/audit-logs?cursor=eyJpZCI6Li4ufQ&pageSize=50 → 200 OK
```

```json
{
  "object": "list",
  "data": [...],
  "nextCursor": "eyJpZCI6Li4ufQ",
  "hasMore": true
}
```

Cursors are opaque base64 blobs. Never parse them client-side.

### Opting out of the envelope

Use `@UseEnvelope()` when you need the raw service return shape untouched (e.g. streaming, file downloads, third-party webhook responses).

## Pagination & Queries

### Parameter names (enforced by `OffsetPaginationDto` / `CursorPaginationDto`)

- `page` — 1-based page number (offset mode)
- `pageSize` — items per page, max **100**, default **20**
- `cursor` — opaque string (cursor mode)

### Sorting and filtering

**No global convention.** Each module owns its query DTO — add `sort`, `order`, `q`, `status`, `...` fields as needed with `class-validator` decorators. Example: `ArticleQueryDto` adds a `q` full-text search field.

> [!NOTE]
> When you add a new sort/filter, document it via `@ApiProperty({ description })` so it shows up in Scalar.

## Errors: RFC 9457 Problem Details

All errors are shaped by `ProblemDetailsFilter` (`app/filters/problem-details.filter.ts`) and returned as `Content-Type: application/problem+json`.

### Schema

```json
{
  "type": "/api/errors/validation-failed",
  "title": "Unprocessable Entity",
  "status": 422,
  "instance": "/api/articles",
  "code": "VALIDATION_FAILED",
  "detail": "Request body failed validation",
  "request_id": "req_01H...",
  "correlation_id": "corr_01H...",
  "trace_id": "trace_01H...",
  "errors": [
    {
      "field": "title",
      "pointer": "/title",
      "code": "IS_NOT_EMPTY",
      "message": "title should not be empty"
    }
  ]
}
```

**Field meanings**:

- `type` — URI identifier for the error class (not a live URL, just a stable reference)
- `title` — short human-readable class name (typically the HTTP status phrase)
- `status` — HTTP status code
- `instance` — the request URI that triggered the error
- `code` — machine-readable business error code (UPPER_SNAKE_CASE)
- `detail` — human-readable explanation for the specific occurrence
- `request_id` / `correlation_id` / `trace_id` — for log correlation
- `errors[]` — field-level errors (only for validation failures)

### Business error codes

Defined centrally in `shared-kernel/infrastructure/enums/error-code.ts` as an `as const` object. Examples:

- `USER_NOT_FOUND`
- `IDEMPOTENCY_KEY_REUSE_CONFLICT`
- `ORDER_VERSION_CONFLICT`
- `VALIDATION_FAILED`

**Add a new code** when the client needs to branch on the specific failure (e.g. show a different UI). For one-off errors, reuse generic HTTP status codes.

### Validation failures

`class-validator` errors are converted to **422 Unprocessable Entity** with `errors[]` populated — one entry per failing constraint. `field` uses dot notation; `pointer` uses JSON Pointer (RFC 6901) for precise nested field references.

## Authentication

### Token format

```http
Authorization: Bearer <jwt>
```

Extracted via `ExtractJwt.fromAuthHeaderAsBearerToken()` in `jwt.strategy.ts`. No cookie auth, no query-string tokens.

### Global guard chain

Registered in `app.module.ts` via `APP_GUARD`, in execution order:

```ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },    // 1. verify JWT
  { provide: APP_GUARD, useClass: RolesGuard },      // 2. check @Roles()
  { provide: APP_GUARD, useClass: ThrottlerGuard },  // 3. rate-limit
]
```

Every endpoint is protected by default. Opt out with `@Public()`.

### Public endpoints

```ts
@Public()
@Get('health')
healthCheck() { ... }
```

The `@Public()` decorator (`shared-kernel/infrastructure/decorators/public.decorator.ts`) sets metadata that `JwtAuthGuard` checks and short-circuits.

### OAuth

Routes: `/api/auth/oauth/{google|github}/callback`

On success, the controller redirects to:

```
${FRONTEND_URL}/oauth/callback?token={accessToken}&refreshToken={refreshToken}
```

The frontend's `/oauth/callback` page extracts the tokens and stores them.

## Role-Based Access Control

### Declaring required roles

```ts
@Roles('ADMIN')
@Post()
createUser() { ... }

@Roles('ADMIN', 'USER')  // OR — any role satisfies
@Get()
listUsers() { ... }
```

`@Roles()` (`shared-kernel/infrastructure/decorators/roles.decorator.ts`) sets `ROLES_KEY` metadata. `RolesGuard` reads it and checks with **OR** semantics via `requiredRoles.some(...)`.

### Role source of truth

The `user_role` PostgreSQL enum in `packages/database/src/schemas/identity/users.schema.ts` is the source of truth:

```ts
pgEnum('user_role', ['ADMIN', 'USER'])
```

`RoleType` is derived — never hand-written:

```ts
// shared-kernel/domain/value-objects/role.vo.ts
export type RoleType = UserDatabase['role']
export const ROLES = { ADMIN: 'ADMIN', USER: 'USER' } as const
export const ROLE_HIERARCHY = ['USER', 'ADMIN']  // higher index = more privileges
```

Add a new role in **one place**: the pgEnum. Rebuild `@workspace/database`, and TypeScript will error-propagate the change everywhere.

### No role on a route → authenticated users pass

If a route has `JwtAuthGuard` but no `@Roles()`, any authenticated user reaches it. Add `@Roles('ADMIN')` when admin-only.

## Idempotency

The `order` module implements full idempotency for mutation endpoints. Use it as a reference for any other non-idempotent operation.

### Request

```http
POST /api/orders
Idempotency-Key: 01HXYZ...
Content-Type: application/json
```

### Behavior (implemented in `OrderService.createOrder`)

1. Compute SHA-256 hash of the request body
2. Look up `idempotency:{key}` in Redis (TTL 24h)
3. **Cache miss** → process normally, store `{ hash, response }`
4. **Cache hit, hash matches** → return the stored response with `Idempotent-Replayed: true` header (safe replay)
5. **Cache hit, hash differs** → **422** `IDEMPOTENCY_KEY_REUSE_CONFLICT` (client bug: same key, different payload)

### Why 24h?

Long enough to cover client retry windows and flaky-network scenarios; short enough to bound Redis memory. Tune via `IDEMPOTENCY_TTL_SECONDS` if needed.

## Optimistic Locking

Implemented via `ETag` / `If-Match` on the `order` aggregate. Every state-changing request on a versioned resource must send `If-Match`.

### Read

```http
GET /api/orders/abc-123
```

```http
HTTP/1.1 200 OK
ETag: "5"
```

### Write

```http
POST /api/orders/abc-123/pay
If-Match: "5"
```

- **Version matches** → process, increment `version`, respond with new `ETag`
- **Version differs** → **412 Precondition Failed** + `ORDER_VERSION_CONFLICT` code
- **`If-Match` missing** → **428 Precondition Required**

### Why version lives inside the aggregate

`order.aggregate.ts` owns `#version: number` and increments it on every state transition. The repository persists it; the controller surfaces it as the ETag. Domain logic stays pure — the aggregate doesn't know about HTTP.

### ETag middleware

`app/middleware/etag.middleware.ts` generates ETags for responses. Business-set ETags (from versioned aggregates) are preserved; otherwise it falls back to a content MD5. `If-None-Match` conditional GETs return **304 Not Modified**.

## Audit Logging

Driven by **domain events**, not decorators. Keeps write controllers free of audit concerns.

### How it works

1. Write operation emits a domain event (`UserCreatedEvent`, `OrderPaidEvent`, ...)
2. Audit listeners under `modules/audit-log/application/listeners/` pick up `@OnEvent(...)` hooks
3. Listener persists an `AuditLog` row with a normalized shape

### Log shape

```ts
{
  action: 'user.created' | 'auth.login' | ...,
  actorId?: string,
  actorEmail?: string,
  resourceType?: string,   // 'user', 'order', ...
  resourceId?: string,
  before?: object,         // state before change
  after?: object,          // state after change
  detail?: object,
  occurredAt: Date
}
```

### Currently audited

- **Auth** — login (password and OAuth), OAuth registration
- **Identity** — user created / banned / unbanned / role-assigned / deleted
- **Order** — (via order events; see `modules/order/domain/events/`)

### Adding audit to a new context

1. Define a domain event under `{context}/domain/events/`
2. Emit it from the aggregate (or the service, for simple CRUD)
3. Add an `@OnEvent()` listener under `modules/audit-log/application/listeners/`

No decorators, no controller changes. The event is the contract.

## Logging

Powered by `nestjs-pino` + `pino-http`. HTTP logs cover `/api/*` only (allowlist in `app/logger/logger.config.ts`).

**Redaction** — sensitive fields (`password`, `token`, `authorization`, ...) are automatically redacted at the logger level. When adding new sensitive fields, update the `redact` list in `logger.config.ts` rather than scrubbing at call sites.

**Correlation IDs** — every request gets a `request_id`. Propagate it into problem details (done automatically) and any outbound HTTP calls.

## OpenAPI & Documentation

### Endpoints

- **`/docs`** — Scalar API Reference (recommended UI)
- **`/swagger`** — classic Swagger UI (fallback)
- **`/openapi.yaml`** — raw OpenAPI 3.0 spec (consumed by `@workspace/api-types` generator)

### DTO annotation requirements

Every DTO field and every controller method must be annotated — Scalar is only as useful as the spec. Missing annotations show up as blanks in the UI.

- `@ApiProperty({ description, example, type })` on every DTO field
- `@ApiOperation({ summary })` on every controller method
- `@ApiResponse({ status, description, type })` for non-obvious responses

### `operationId` format

Auto-generated as `${controllerKey}_${methodKey}` (e.g. `order_create`, `article_list`). The frontend type generator consumes these as hook names, so keep method names meaningful.

### Regenerating frontend types

After any backend endpoint change:

```bash
# Terminal 1 — API running
pnpm --filter api dev

# Terminal 2 — regenerate
pnpm --filter @workspace/api-types api:gen
```

See [`CONTRIBUTING.md`](../CONTRIBUTING.md#3-sync-api-types-to-the-frontend) for the full workflow.

## Quick Reference

- **New endpoint returning a list?** → Use `OffsetListResponseDto` or `CursorListResponseDto`. Interceptor handles `object: 'list'`.
- **New error condition?** → Add a code in `error-code.ts`. Throw an exception that extends the problem-details base; the filter shapes it.
- **New mutation that must be safe to retry?** → Add `Idempotency-Key` handling; follow `OrderService.createOrder` as the reference.
- **New versioned resource?** → Give the aggregate a `#version`; surface via ETag; require `If-Match` on writes.
- **New audited action?** → Emit a domain event; add a listener under `audit-log/`.
- **New role?** → Add to the `user_role` pgEnum, rebuild `@workspace/database`. Everything else falls out of the type system.
