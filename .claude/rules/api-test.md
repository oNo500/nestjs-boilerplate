---
paths:
  - apps/api/**/*.spec.ts
  - apps/api/**/*.e2e-spec.ts
  - apps/api/src/__tests__/**
---

# API Testing Rules

Testing rules for `apps/api`: which layer gets which test type, where tests live, and how mocks and fixtures are structured.

## Test Layering

| Layer | Test type | Tools |
|---|---|---|
| `application/services/`, `domain/` | Unit (`.spec.ts`) | Vitest + `@golevelup/ts-vitest` |
| `presentation/controllers/`, `infrastructure/repositories/` | E2E (`.e2e-spec.ts`) | Vitest + Supertest + real DB |

- Controllers and Repositories have no unit tests; E2E is their only coverage
- `domain/` objects are instantiated directly, never mocked

## File Locations

- Unit tests colocated with source: `foo.ts` + `foo.spec.ts` in the same directory
- E2E tests under `src/__tests__/`

## TDD

- Red-Green-Refactor cycle; no implementation before its test
- Tests drive from `application/services/`; port interfaces are added as needed; implementation follows the tests

## Mocks

- Mock port interfaces with `createMock<T>()`
- Instantiate services via `new` by default; use `Test.createTestingModule` only when a NestJS-provided dependency is required (`ConfigService`, `JwtService`, etc.)
- Per-context mock provider arrays live in `src/__tests__/unit/factories/mock-factory.ts`

## Fixtures

- Domain object fixtures live in `src/__tests__/unit/factories/domain-fixtures.ts`
- Constructed via aggregate factory methods or `reconstitute`; never via DTOs or the database

## E2E Isolation

- E2E data is namespaced via `globalThis.e2ePrefix` (timestamp prefix) to prevent contamination across concurrent suites
