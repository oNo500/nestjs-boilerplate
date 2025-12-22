import { defineConfig } from 'eslint/config'
import plugin from 'eslint-plugin-package-json'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

/**
 * Package.json configuration options
 */
export interface PackageJsonOptions extends OptionsOverrides {
  /**
   * Enable stylistic rules
   * @default true
   */
  stylistic?: boolean

  /**
   * Enforce rules for private packages
   * @default false - name and version not enforced, other fields enforced
   */
  enforceForPrivate?: boolean
}

/**
 * Package.json rules configuration
 *
 * @description
 * Checks package.json consistency, readability, and validity, including:
 * - Required field validation (name, version, description, license, etc.)
 * - Field format validation (naming conventions, version format, licenses, etc.)
 * - Dependency validation (duplicate dependencies, version ranges, etc.)
 * - Property and collection sorting
 *
 * @param options - Configuration options
 * @param options.stylistic - Enable stylistic rules (property ordering, naming conventions, etc.)
 * @param options.enforceForPrivate - Enforce require-* rules for private packages ("private": true)
 * @param options.overrides - Custom rule overrides
 * @returns ESLint config array
 *
 * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json
 *
 * @example
 * ```ts
 * // Use default config (recommended + stylistic)
 * export default await composeConfig({
 *   packageJson: true,
 * });
 *
 * // Only enable recommended rules
 * export default await composeConfig({
 *   packageJson: {
 *     stylistic: false,
 *   },
 * });
 *
 * // Custom config
 * export default await composeConfig({
 *   packageJson: {
 *     stylistic: true,
 *     enforceForPrivate: false,
 *     overrides: {
 *       'package-json/require-keywords': 'off', // Don't require keywords
 *     },
 *   },
 * });
 * ```
 */
export function packageJson(options: PackageJsonOptions = {}): Linter.Config[] {
  const { stylistic = true, enforceForPrivate, overrides = {} } = options

  return defineConfig({
    name: 'package-json/rules',
    plugins: {
      'package-json': plugin,
    },
    extends: [plugin.configs.recommended],
    rules: {
      ...(stylistic ? plugin.configs.stylistic.rules : {}),
      'package-json/valid-local-dependency': 'off', // Allow link: local dependencies
      ...overrides,
    },
    ...(enforceForPrivate !== undefined && {
      settings: {
        packageJson: {
          enforceForPrivate,
        },
      },
    }),
  })
}
