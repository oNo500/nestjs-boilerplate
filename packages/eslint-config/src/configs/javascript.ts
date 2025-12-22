import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

import { GLOB_SRC } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type JavaScriptOptions = OptionsFiles & OptionsOverrides

/**
 * JavaScript base configuration
 *
 * @param options - Config options
 * @param options.files - File patterns
 * @param options.overrides - Rule overrides
 * @returns ESLint config array
 */
export function javascript(options: JavaScriptOptions = {}): Linter.Config[] {
  const { files = [GLOB_SRC], overrides = {} } = options

  return defineConfig({
    name: 'javascript/rules',
    files,
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.es2021,
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
