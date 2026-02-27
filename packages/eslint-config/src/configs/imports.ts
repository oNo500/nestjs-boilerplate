/**
 * Import rule configuration providing import ordering, circular dependency detection, and TypeScript support
 */
import { defineConfig } from 'eslint/config'
import { importX } from 'eslint-plugin-import-x'

import { GLOB_SRC } from '../utils'

import type { ImportsOptions } from '../types'
import type { ESLint, Linter } from 'eslint'

export function imports(options: ImportsOptions = {}): Linter.Config[] {
  const { overrides = {}, stylistic = true, typescript = false, noRelativeParentImports = false } = options

  const files = [GLOB_SRC]

  const settingsForTypescript = typescript
    ? {
        ...importX.configs['flat/recommended'].settings,
        'import-x/resolver': { typescript: { alwaysTryTypes: true } },
      }
    : {}

  const rulesForTypescript = typescript
    ? {
        ...importX.configs['flat/typescript'].rules,
        'import-x/named': 'off',
        'import-x/namespace': 'off',
        'import-x/default': 'off',
        'import-x/no-named-as-default-member': 'off',
        'import-x/no-unresolved': 'off',
      }
    : {}

  const rulesForStylistic: Record<string, Linter.RuleEntry> = stylistic
    ? {
        'import-x/newline-after-import': ['error', { count: 1 }],
        'import-x/order': [
          'error',
          {
            'groups': [
              'builtin',
              'external',
              'internal',
              ['parent', 'sibling'],
              'index',
              'type',
            ],
            'newlines-between': 'always',
            'alphabetize': {
              order: 'asc',
              caseInsensitive: true,
            },
            'pathGroups': [
              {
                pattern: '@/**',
                group: 'internal',
                position: 'before',
              },
            ],
            'pathGroupsExcludedImportTypes': ['type'],
            'distinctGroup': true,
          },
        ],
      }
    : {}

  return defineConfig([
    {
      name: 'imports/rules',
      files,
      plugins: {
        'import-x': importX as unknown as ESLint.Plugin,
      },
      settings: settingsForTypescript,
      rules: {
        ...importX.configs['flat/recommended'].rules,
        ...rulesForTypescript,
        ...rulesForStylistic,
        'import-x/consistent-type-specifier-style': 'error',
        'import-x/no-named-as-default': 'warn',
        'import-x/no-cycle': 'error',
        'import-x/no-unused-modules': 'error',
        'import-x/no-deprecated': 'warn',
        'import-x/no-extraneous-dependencies': 'error',
        'import-x/no-relative-parent-imports': noRelativeParentImports ? 'error' : 'off',
        ...overrides,
      },
    },
  ])
}
