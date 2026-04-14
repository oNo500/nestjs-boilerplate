# Constitution

Project-wide principles and hard rules. All package-level rules (`api.md`, `admin-shadcn.md`, `database.md`) must comply with this document.

## Core Principles

- **Library-first**: reach for mature third-party libraries before writing new code; verify no equivalent already exists in the project
- **MVP-first**: implement only what the current requirement needs; no speculative abstractions or config switches for hypothetical futures
- **Test-driven (non-negotiable)**: tests before implementation, Red-Green-Refactor cycle
- **Functional-first**: prefer pure functions and immutable data; isolate side effects in the infrastructure layer
- **Feature-based organization**: organize by business capability, not by technical layer; each sub-project defines its own layering in its rules file

## Hard Rules

- **Colocated tests**: test files sit next to source (`foo.ts` + `foo.spec.ts`)
- **Env-driven config**: all configuration flows through environment variables; no hard-coded values

## Quality Gates

All changes must pass before merge:

- `turbo typecheck` — zero TypeScript errors
- `turbo lint` — zero lint warnings
- `turbo test` — all unit tests passing
