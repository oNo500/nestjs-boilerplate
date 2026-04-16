<!--
Thanks for contributing! Fill out every section below.
Empty or placeholder PRs will be asked to update before review.
-->

## Summary

<!-- One or two sentences: what changes and why. -->

## Type of Change

<!-- Check the one that best describes this PR. -->

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `refactor` — internal restructuring, no behavior change
- [ ] `perf` — performance improvement
- [ ] `docs` — documentation only
- [ ] `test` — test-only change
- [ ] `chore` — build, tooling, dependencies
- [ ] `style` — formatting, no code change

## Scope

<!-- Which packages does this touch? Check all that apply. -->

- [ ] `apps/api`
- [ ] `apps/admin-shadcn`
- [ ] `packages/database`
- [ ] `packages/api-types`
- [ ] `packages/ui`
- [ ] `packages/icons`
- [ ] Tooling / CI / docs

## Changes

<!-- Bulleted list of the notable changes. Reviewer reads this first. -->

-
-

## Verification

<!-- How did you verify this works? Commands run, manual checks, screenshots for UI. -->

-

## Pre-merge checklist

- [ ] `turbo lint` passes
- [ ] `turbo typecheck` passes
- [ ] `turbo test` passes (unit + E2E where relevant)
- [ ] Database schema changed → `@workspace/database` rebuilt and migration committed
- [ ] Backend API changed → `@workspace/api-types` regenerated
- [ ] New UI components added via `shadcn` CLI, not hand-written
- [ ] Commit messages follow Conventional Commits (`type(scope): subject`)
- [ ] Documentation updated (`README.md`, `CONTRIBUTING.md`, or `docs/`) if user-facing behavior changed

## Breaking Changes

<!-- Does this break any public API, DB schema, or env var contract? Describe migration path. -->

- [ ] This PR contains no breaking changes
- [ ] This PR contains breaking changes (describe below)

## Related Issues

<!-- "Closes #123", "Relates to #456" — link any relevant issues or prior PRs. -->
