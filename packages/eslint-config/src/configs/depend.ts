import { fixupPluginRules } from '@eslint/compat'
import dependPlugin from 'eslint-plugin-depend'

import { GLOB_SRC } from '../utils'

import type { OptionsOverrides } from '../types'
import type { ESLint, Linter } from 'eslint'

/**
 * Depend configuration options
 */
export interface DependOptions extends OptionsOverrides {
  /**
   * Preset list
   *
   * - `native`: Detect packages replaceable by native JavaScript APIs (e.g., `is-nan` → `Number.isNaN()`)
   * - `microutilities`: Detect micro utilities (packages implementable in one line)
   * - `preferred`: Recommend lighter, better-maintained alternatives
   *
   * @default ['native', 'microutilities', 'preferred']
   */
  presets?: ('native' | 'microutilities' | 'preferred')[]

  /**
   * Custom banned module list
   * @default []
   */
  modules?: string[]

  /**
   * Allowed module list (even if in presets)
   * @default []
   */
  allowed?: string[]
}

/**
 * Dependency optimization rules
 *
 * @description
 * Detects and suggests optimized dependency choices, including:
 * - Packages replaceable by native APIs
 * - Micro utilities (one-line implementable packages)
 * - Better-maintained alternatives
 *
 * @param options - Configuration options
 * @param options.presets - Preset rule sets
 * @param options.modules - Custom banned modules
 * @param options.allowed - Module whitelist
 * @param options.overrides - Custom rule overrides
 * @returns ESLint config array
 *
 * @see https://github.com/es-tooling/eslint-plugin-depend
 *
 * @example
 * ```ts
 * // Use default config (all presets)
 * export default await composeConfig({
 *   depend: true,
 * });
 *
 * // Custom config
 * export default await composeConfig({
 *   depend: {
 *     presets: ['native', 'preferred'], // Enable only some presets
 *     modules: ['lodash'], // Ban lodash
 *     allowed: ['moment'], // Allow moment (even if in preset)
 *   },
 * });
 *
 * // Progressive adoption (recommended)
 * export default await composeConfig({
 *   depend: {
 *     presets: ['native'], // Start with native replacements only
 *     allowed: ['some-legacy-package'], // Temporarily allow legacy deps
 *   },
 * });
 * ```
 */
export function depend(options: DependOptions = {}): Linter.Config[] {
  const { presets = [], modules = [], allowed = [], overrides = {} } = options

  return [
    {
      name: 'depend/rules',
      files: [GLOB_SRC],
      plugins: {
        depend: fixupPluginRules(dependPlugin as unknown as ESLint.Plugin),
      },
      rules: {
        'depend/ban-dependencies': [
          'error',
          {
            presets: ['native', 'microutilities', 'preferred', ...presets],
            modules,
            allowed: [
              'dotenv', // Required by drizzle.config.ts and utility scripts
              ...allowed,
            ],
          },
        ],
        // User custom overrides
        ...overrides,
      },
    },
  ]
}
