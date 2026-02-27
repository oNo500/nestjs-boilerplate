/**
 * @workspace/eslint-config
 *
 * Composable ESLint configuration factory
 *
 * @example
 * ```typescript
 * import { composeConfig } from '@workspace/eslint-config'
 *
 * export default composeConfig({
 *   typescript: { tsconfigRootDir: import.meta.dirname },
 *   react: true,
 *   tailwind: true,
 *   imports: { typescript: true },
 *   prettier: true,
 * })
 * ```
 */

import { defineConfig } from 'eslint/config'
import { configs as tsConfigs, parser as tsParser } from 'typescript-eslint'

import { a11y } from './configs/a11y'
import { tailwind } from './configs/better-tailwindcss'
import { boundaries } from './configs/boundaries'
import { depend } from './configs/depend'
import { ignores } from './configs/ignores'
import { imports } from './configs/imports'
import { javascript } from './configs/javascript'
import { jsdoc } from './configs/jsdoc'
import { nextjs } from './configs/nextjs'
import { packageJson } from './configs/package-json'
import { prettier } from './configs/prettier'
import { react } from './configs/react'
import { storybook } from './configs/storybook'
import { stylistic } from './configs/stylistic'
import { typescript } from './configs/typescript'
import { unicorn } from './configs/unicorn'
import { vitest } from './configs/vitest'

import type {
  A11yOptions,
  BoundariesOptions,
  DependOptions,
  IgnoresOptions,
  ImportsOptions,
  JavaScriptOptions,
  JsdocOptions,
  NextjsOptions,
  PackageJsonOptions,
  PrettierOptions,
  ReactOptions,
  StorybookOptions,
  StylisticOptions,
  TailwindOptions,
  TypeScriptOptions,
  UnicornOptions,
  VitestOptions,
} from './types'
import type { Linter } from 'eslint'

// ============================================================================
// Type definitions
// ============================================================================

/**
 * Options for composeConfig
 *
 * Each config entry accepts:
 * - `true` - enable with default options
 * - `object` - enable with custom options
 * - `false` - explicitly disable (required for configs that are on by default)
 * - omitted - leave disabled (for configs that are off by default)
 */
export interface ComposeConfigOptions {
  // Base configuration (enabled by default)
  /** Ignore patterns configuration @default true */
  ignores?: boolean | IgnoresOptions
  /** JavaScript base configuration @default true */
  javascript?: boolean | JavaScriptOptions
  /** TypeScript configuration @default true */
  typescript?: boolean | TypeScriptOptions
  /** Code style rules @default true */
  stylistic?: boolean | StylisticOptions
  /** Unicorn best practices @default true */
  unicorn?: boolean | UnicornOptions
  /** Dependency optimization suggestions @default true */
  depend?: boolean | DependOptions
  /** Rules for config files (*.config.ts) without type-checking @default true */
  configFiles?: boolean

  // Framework configuration
  /** React configuration */
  react?: boolean | ReactOptions
  /** Next.js configuration */
  nextjs?: boolean | NextjsOptions
  /** Tailwind CSS configuration */
  tailwind?: boolean | TailwindOptions

  // Tooling configuration
  /** Import ordering and rules */
  imports?: boolean | ImportsOptions
  /** Prettier formatting */
  prettier?: boolean | PrettierOptions

  // Quality configuration
  /** Accessibility rules */
  a11y?: boolean | A11yOptions
  /** JSDoc documentation rules */
  jsdoc?: boolean | JsdocOptions
  /** Module boundary rules */
  boundaries?: boolean | BoundariesOptions
  /** package.json rules */
  packageJson?: boolean | PackageJsonOptions

  // Testing configuration
  /** Vitest testing rules */
  vitest?: boolean | VitestOptions
  /** Storybook rules */
  storybook?: boolean | StorybookOptions
}

// ============================================================================
// Core function
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConfigFn = (opts: any) => Linter.Config[]

type ConfigEntry = {
  key: keyof ComposeConfigOptions
  fn: ConfigFn
  defaultOn?: boolean
  /** Values derived from global options to inject; overridden by explicit user config */
  inject?: (options: ComposeConfigOptions) => Record<string, unknown>
}

const CONFIG_REGISTRY: ConfigEntry[] = [
  // Enabled by default
  { key: 'ignores', fn: ignores, defaultOn: true },
  { key: 'javascript', fn: javascript, defaultOn: true },
  {
    key: 'typescript',
    fn: typescript,
    defaultOn: true,
  },
  { key: 'stylistic', fn: stylistic, defaultOn: true },
  { key: 'unicorn', fn: unicorn, defaultOn: true },
  { key: 'depend', fn: depend, defaultOn: true },
  // Opt-in (order is fixed; prettier must come last)
  {
    key: 'imports',
    fn: imports,
    inject: (options) => ({ typescript: options.typescript !== false }),
  },
  { key: 'react', fn: react },
  { key: 'nextjs', fn: nextjs },
  { key: 'tailwind', fn: tailwind },
  { key: 'a11y', fn: a11y },
  { key: 'jsdoc', fn: jsdoc },
  { key: 'boundaries', fn: boundaries },
  { key: 'packageJson', fn: packageJson },
  { key: 'vitest', fn: vitest },
  { key: 'storybook', fn: storybook },
  { key: 'prettier', fn: prettier },
]

/** Composes ESLint configs in the correct internal order */
export function composeConfig(options: ComposeConfigOptions = {}): Linter.Config[] {
  const configs: Linter.Config[] = []

  for (const { key, fn, defaultOn, inject } of CONFIG_REGISTRY) {
    const opt = options[key]
    const enabled = defaultOn ? opt !== false : !!opt
    if (!enabled) continue

    const base = typeof opt === 'object' ? opt : {}
    const injected = inject ? inject(options) : {}
    configs.push(...fn({ ...injected, ...base }))
  }

  return options.configFiles === false
    ? configs
    : defineConfig([
        {
          ignores: ['*.config.ts', '*.config.mts'],
          extends: [configs],
        },
        {
          name: 'typescript/config-files',
          files: ['*.config.ts', '*.config.mts'],
          extends: [tsConfigs.recommended],
          languageOptions: {
            parser: tsParser,
            parserOptions: {
              project: false,
              tsconfigRootDir: (typeof options.typescript === 'object' ? options.typescript.tsconfigRootDir : undefined) ?? process.cwd(),
            },
          },
        },
      ])
}

// ============================================================================
// Type exports
// ============================================================================

export type {
  A11yOptions,
  BoundariesOptions,
  DependOptions,
  IgnoresOptions,
  ImportsOptions,
  JavaScriptOptions,
  JsdocOptions,
  NextjsOptions,
  PackageJsonOptions,
  PrettierOptions,
  ReactOptions,
  StorybookOptions,
  StylisticOptions,
  TailwindOptions,
  TypeScriptOptions,
  UnicornOptions,
  VitestOptions,
} from './types'

// ============================================================================
// Constant exports
// ============================================================================

export { GLOB_SRC, GLOB_JS, GLOB_TS, GLOB_JSX, GLOB_TESTS, GLOB_JSON, GLOB_MARKDOWN } from './utils'
