import { fixupPluginRules } from '@eslint/compat'
import vitestPlugin from '@vitest/eslint-plugin'
import { defineConfig } from 'eslint/config'

import { GLOB_TESTS, isInEditorEnv } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { ESLint, Linter } from 'eslint'

export type VitestOptions = OptionsFiles & OptionsOverrides & {
  /**
   * Running in editor
   * .skip/.only show warnings in editor, errors in CI
   */
  isInEditor?: boolean
}

/**
 * Vitest testing rules configuration
 *
 * Uses @vitest/eslint-plugin recommended rule set
 * Includes testing best practices, common error detection, etc.
 *
 * Test-specific configuration (based on Vue, Vite, etc. best practices):
 * - Relax general rules (no-console, no-undef, etc.)
 * - Relax TypeScript strictness (allow @ts-ignore, no explicit types, etc.)
 * - Enforce test quality (prevent committing .skip and .only tests)
 *
 * @param options - Configuration options
 * @param options.files - File patterns, defaults to all test files
 * @param options.overrides - Custom rule overrides
 * @param options.isInEditor - Running in editor, affects .skip/.only strictness
 * @returns ESLint config array
 */
export function vitest(options: VitestOptions = {}): Linter.Config[] {
  const {
    files = GLOB_TESTS,
    overrides = {},
    isInEditor = isInEditorEnv(),
  } = options

  return defineConfig([
    // TODO: Many compatibility issues, need actual testing
    {
      name: 'vitest/rules',
      files,
      plugins: {
        vitest: fixupPluginRules(vitestPlugin as unknown as ESLint.Plugin), // Compatibility fix
      },
      rules: {
        ...vitestPlugin.configs.recommended.rules,

        // Relax rules for test code (based on Vite project best practices)
        'no-console': 'off', // Allow console in tests
        'no-restricted-globals': 'off', // Allow test environment globals
        'no-restricted-syntax': 'off', // Allow special syntax in tests
        'no-undef': 'off', // TypeScript handles type checking
        '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-ignore etc.
        '@typescript-eslint/explicit-module-boundary-types': 'off', // Test functions don't need explicit return types
        '@typescript-eslint/unbound-method': 'off', // Mock methods don't need binding
        'unicorn/no-null': 'off', // Returning null in mocks is reasonable

        // Test code style consistency
        'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }], // Use it consistently
        'vitest/no-identical-title': 'error', // Prevent duplicate test titles
        'vitest/prefer-hooks-in-order': 'error', // Enforce hook order
        'vitest/prefer-lowercase-title': 'error', // Consistent lowercase titles

        // Test quality assurance (warning in editor, error in CI)
        'vitest/no-disabled-tests': isInEditor ? 'warn' : 'error', // Prevent committing .skip tests
        'vitest/no-focused-tests': isInEditor ? 'warn' : 'error', // Prevent committing .only tests

        ...overrides,
      },
      settings: {
        vitest: {
          typecheck: true,
        },
      },
    },
  ])
}
