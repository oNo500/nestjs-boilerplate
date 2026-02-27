/**
 * Unicorn ESLint configuration providing 100+ powerful rules to improve code quality and consistency
 */
import { defineConfig } from 'eslint/config'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

import { GLOB_SRC } from '../utils'

import type { UnicornOptions } from '../types'
import type { Linter } from 'eslint'

export function unicorn(options: UnicornOptions = {}): Linter.Config[] {
  const { files = [GLOB_SRC], overrides = {} } = options

  return defineConfig({
    name: 'unicorn/rules',
    files,
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      ...overrides,
    },
  })
}
