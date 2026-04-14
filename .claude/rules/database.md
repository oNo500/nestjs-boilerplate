---
paths:
  - packages/database/**
---

# Database Package Rules (`@workspace/database`)

Rules for Drizzle ORM schemas, migrations, and the package's place in the monorepo.

## Tech Stack

- **ORM**: Drizzle ORM
- **Driver**: PostgreSQL (`pg` · `postgres`)
- **Migrations**: `drizzle-kit`
- **Build**: `tsdown`
- **Language**: TypeScript (ESM)

## Structure

```
packages/database/
├── src/
│   ├── schemas/                     # Schemas grouped by business domain
│   │   ├── identity/                # Auth tables; follow Better Auth conventions
│   │   │   ├── users.schema.ts
│   │   │   ├── accounts.schema.ts         # Credentials: password hash, OAuth tokens
│   │   │   ├── sessions.schema.ts         # Login sessions: token, device, expiry
│   │   │   └── verifications.schema.ts    # One-time email/phone verification codes
│   │   ├── audit/                   # Audit data, owned by the audit-log module
│   │   │   ├── audit-logs.schema.ts       # Write-operation audit trail
│   │   │   └── login-logs.schema.ts       # Login attempts (including failures)
│   │   ├── {domain}.schema.ts       # Single-domain schemas at top level
│   │   └── index.ts                 # Re-exports
│   ├── relations.ts                 # All table relations, centralized
│   └── index.ts                     # Package entry
├── drizzle/                         # Generated migrations (never edit by hand)
├── scripts/
│   ├── seed.ts
│   └── local-db.ts
└── drizzle.config.ts
```

## Schema Ownership

| Directory | Owner context | Business code may write? |
|---|---|---|
| `identity/` | `identity` | Yes, but fields must stay Better Auth-compatible |
| `audit/` | `audit-log` | Yes |

## Schema Change Workflow

```bash
# 1. Edit packages/database/src/schemas/
# 2. Rebuild so downstream packages see the new types
pnpm --filter @workspace/database build
# 3. Dev: push schema changes directly
pnpm --filter @workspace/database db:push
# 4. Prod: generate migration files
pnpm --filter @workspace/database db:generate
```

## Rules

- **One schema per domain file**: `{domain}.schema.ts`, or a directory when a domain has multiple tables
- **Relations centralized**: all table relations declared in `relations.ts`, never in schema files
- **Relative imports**: schemas reference each other by relative path (Drizzle Kit does not resolve path aliases)
- **Sync on delete/rename**: removing or renaming a schema requires updating `relations.ts` in the same change

## Prohibited

- Business logic inside this package
- Manual edits to files under `drizzle/` (migrations are generated)
- Hard-coded connection strings in schema or config
- Skipping the rebuild step before consuming new types in downstream packages
