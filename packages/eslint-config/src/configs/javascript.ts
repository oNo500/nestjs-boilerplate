/**
 * JavaScript ESLint base configuration with recommended rules and ES2026+ global variable support
 */
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

import { GLOB_SRC } from '../utils'

import type { JavaScriptOptions } from '../types'
import type { Linter } from 'eslint'

export function javascript(options: JavaScriptOptions = {}): Linter.Config[] {
  const { files = [GLOB_SRC], overrides = {} } = options

  return defineConfig({
    name: 'javascript/rules',
    files,
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.es2026,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
    },
    rules: {
      ...overrides,
    },
  })
}
