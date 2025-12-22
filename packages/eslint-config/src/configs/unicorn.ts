import defu from 'defu'
import { defineConfig } from 'eslint/config'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

import { GLOB_SRC } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

/**
 * Unicorn best practices configuration
 *
 * Provides 100+ powerful ESLint rules to improve code quality and consistency
 *
 * @param options - Configuration options
 * @param options.files - File patterns to apply this config
 * @param options.overrides - Custom rule overrides
 * @returns ESLint config array
 *
 * @example
 * ```ts
 * import { unicorn } from 'infra-es';
 *
 * export default [
 *   ...unicorn({
 *     overrides: {
 *       'unicorn/prevent-abbreviations': 'off',
 *     },
 *   }),
 * ];
 * ```
 */
export type UnicornOptions = OptionsFiles & OptionsOverrides

export function unicorn(options: UnicornOptions = {}): Linter.Config[] {
  const { files = [GLOB_SRC], overrides = {} } = options

  return defineConfig({
    name: 'unicorn/rules',
    files,
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: defu(overrides, {
      // Modern libraries like drizzle, react-query use null by default, incompatible with data operations
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
    }),
  })
}
