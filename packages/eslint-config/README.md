# @infra-x/eslint-config

Composable ESLint flat config factory for infra-x projects.

## Installation

```bash
pnpm add -D @infra-x/eslint-config eslint globals
```

## Usage

```typescript
// eslint.config.mts
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  tailwind: true,
  imports: true,
})
```

For multiple config segments (e.g. separate test rules):

```typescript
// eslint.config.mts
import { GLOB_TESTS, composeConfig } from '@infra-x/eslint-config'
import { defineConfig } from 'eslint/config'

const appConfig = defineConfig({
  extends: composeConfig({
    typescript: { tsconfigRootDir: import.meta.dirname },
    imports: true,
    react: true,
    nextjs: true,
  }),
})

const vitestConfig = defineConfig({
  files: GLOB_TESTS,
  extends: composeConfig({
    typescript: { tsconfigRootDir: import.meta.dirname },
    vitest: true,
    unicorn: false,
    stylistic: false,
    depend: false,
  }),
})

export default [...appConfig, ...vitestConfig]
```

Each option accepts `true` (defaults), an options object, or `false` (disable).

## Options

Default-on: `globalIgnores` · `javascript` · `typescript` · `stylistic` · `unicorn` · `depend`

Opt-in:

| Option | Description |
|---|---|
| `react` | React + react-hooks rules; set `vite: true` for react-refresh |
| `nextjs` | Next.js rules |
| `tailwind` | Tailwind CSS class ordering (`entryPoint` defaults to `src/global.css`) |
| `imports` | Import ordering and resolution |
| `a11y` | Accessibility rules |
| `jsdoc` | JSDoc rules |
| `boundaries` | Module boundary enforcement |
| `packageJson` | `package.json` rules |
| `vitest` | Vitest testing rules |
| `storybook` | Storybook rules |
| `oxlint` | Disable ESLint rules already covered by oxlint (requires oxlint to run separately) |

All options support an `overrides` field for custom rule overrides, and most accept a `files` glob array.

## Oxlint Integration

When running oxlint alongside ESLint, enable the `oxlint` option to disable duplicate rules:

```typescript
// uses flat/recommended preset
composeConfig({ oxlint: true })

// generate disabled rules from your oxlint config file
composeConfig({ oxlint: { configFile: './.oxlintrc.json' } })
```
