/**
 * Vitest test rule configuration with testing best practices and quality assurance rules
 */
import { fixupPluginRules } from '@eslint/compat'
import vitestPlugin from '@vitest/eslint-plugin'
import { defineConfig } from 'eslint/config'

import { GLOB_TESTS, isInEditorEnv } from '../utils'

import type { VitestOptions } from '../types'
import type { ESLint, Linter } from 'eslint'

export function vitest(options: VitestOptions = {}): Linter.Config[] {
  const {
    files = GLOB_TESTS,
    overrides = {},
    isInEditor = isInEditorEnv(),
  } = options

  return defineConfig([
    {
      name: 'vitest/rules',
      files,
      plugins: {
        vitest: fixupPluginRules(vitestPlugin as unknown as ESLint.Plugin),
      },
      rules: {
        ...vitestPlugin.configs.recommended.rules,

        'no-console': 'off',
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
        'no-undef': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/unbound-method': 'off',
        'unicorn/no-null': 'off',

        'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
        'vitest/no-identical-title': 'error',
        'vitest/prefer-hooks-in-order': 'error',
        'vitest/prefer-lowercase-title': 'error',

        'vitest/no-disabled-tests': isInEditor ? 'warn' : 'error',
        'vitest/no-focused-tests': isInEditor ? 'warn' : 'error',

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
