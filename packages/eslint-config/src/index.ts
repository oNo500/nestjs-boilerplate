/**
 * @workspace/eslint-config
 *
 * Unified ESLint configuration
 *
 * @example
 * ```typescript
 * import { composeConfig } from '@workspace/eslint-config'
 *
 * export default composeConfig({
 *   typescript: { tsconfigRootDir: import.meta.dirname },
 *   react: true,
 *   imports: { typescript: true },
 *   prettier: true,
 * })
 * ```
 */

import { a11y } from './configs/a11y'
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

import type { A11yOptions } from './configs/a11y'
import type { BoundariesOptions } from './configs/boundaries'
import type { DependOptions } from './configs/depend'
import type { IgnoresOptions } from './configs/ignores'
import type { ImportsOptions } from './configs/imports'
import type { JavaScriptOptions } from './configs/javascript'
import type { JsdocOptions } from './configs/jsdoc'
import type { NextjsOptions } from './configs/nextjs'
import type { PackageJsonOptions } from './configs/package-json'
import type { PrettierOptions } from './configs/prettier'
import type { ReactOptions } from './configs/react'
import type { StorybookOptions } from './configs/storybook'
import type { StylisticOptions } from './configs/stylistic'
import type { TypeScriptOptions } from './configs/typescript'
import type { UnicornOptions } from './configs/unicorn'
import type { VitestOptions } from './configs/vitest'
import type { Linter } from 'eslint'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Configuration options for composeConfig
 *
 * Each option supports:
 * - `true` - Use default options
 * - `object` - Pass custom options
 * - `false` - Disable (for configs enabled by default)
 * - omitted - Not enabled (for non-default configs)
 */
export interface ComposeConfigOptions {
  // Base configs (enabled by default)
  /** Ignore files config @default true */
  ignores?: boolean | IgnoresOptions
  /** JavaScript base config @default true */
  javascript?: boolean | JavaScriptOptions
  /** TypeScript config @default true */
  typescript?: boolean | TypeScriptOptions
  /** Code style rules @default true */
  stylistic?: boolean | StylisticOptions
  /** Unicorn best practices @default true */
  unicorn?: boolean | UnicornOptions
  /** Dependency optimization suggestions @default true */
  depend?: boolean | DependOptions

  // Framework configs
  /** React config */
  react?: boolean | ReactOptions
  /** Next.js config */
  nextjs?: boolean | NextjsOptions

  // Tool configs
  /** Import sorting and rules */
  imports?: boolean | ImportsOptions
  /** Prettier formatting */
  prettier?: boolean | PrettierOptions

  // Quality configs
  /** Accessibility rules */
  a11y?: boolean | A11yOptions
  /** JSDoc documentation rules */
  jsdoc?: boolean | JsdocOptions
  /** Module boundary rules */
  boundaries?: boolean | BoundariesOptions
  /** package.json rules */
  packageJson?: boolean | PackageJsonOptions

  // Testing configs
  /** Vitest testing rules */
  vitest?: boolean | VitestOptions
  /** Storybook rules */
  storybook?: boolean | StorybookOptions
}

// ============================================================================
// Main Function
// ============================================================================

const getOpts = <T>(opt: boolean | T | undefined): T => (typeof opt === 'object' ? opt : {}) as T

/** Compose ESLint configs in the correct order */
export function composeConfig(options: ComposeConfigOptions = {}): Linter.Config[] {
  const configs: Linter.Config[] = []

  // Enabled by default
  if (options.ignores !== false) {
    const opts = getOpts(options.ignores)
    configs.push(...ignores(opts.ignores, opts.gitignore))
  }

  if (options.javascript !== false) {
    configs.push(...javascript(getOpts(options.javascript)))
  }

  if (options.typescript !== false) {
    configs.push(...typescript(getOpts(options.typescript)))
  }

  if (options.stylistic !== false) {
    configs.push(...stylistic(getOpts(options.stylistic)))
  }

  if (options.unicorn !== false) {
    configs.push(...unicorn(getOpts(options.unicorn)))
  }

  if (options.depend !== false) {
    configs.push(...depend(getOpts(options.depend)))
  }

  // Must be explicitly enabled
  if (options.imports) {
    const enableTypeScript = options.typescript !== false
    configs.push(
      ...imports(
        typeof options.imports === 'object'
          ? { typescript: enableTypeScript, ...options.imports }
          : { typescript: enableTypeScript },
      ),
    )
  }

  if (options.react) {
    configs.push(...react(getOpts(options.react)))
  }

  if (options.nextjs) {
    configs.push(...nextjs(getOpts(options.nextjs)))
  }

  if (options.a11y) {
    configs.push(...a11y(getOpts(options.a11y)))
  }

  if (options.jsdoc) {
    configs.push(...jsdoc(getOpts(options.jsdoc)))
  }

  if (options.boundaries) {
    configs.push(...boundaries(getOpts(options.boundaries)))
  }

  if (options.packageJson) {
    configs.push(...packageJson(getOpts(options.packageJson)))
  }

  if (options.vitest) {
    configs.push(...vitest(getOpts(options.vitest)))
  }

  if (options.storybook) {
    configs.push(...storybook(getOpts(options.storybook)))
  }

  // prettier must be last
  if (options.prettier) {
    configs.push(...prettier(getOpts(options.prettier)))
  }

  return configs
}

// ============================================================================
// Constant Exports
// ============================================================================

export { GLOB_SRC, GLOB_JS, GLOB_TS, GLOB_JSX, GLOB_TESTS, GLOB_JSON, GLOB_MARKDOWN } from './utils'
