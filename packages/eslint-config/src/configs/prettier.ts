import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-plugin-prettier/recommended'

import { GLOB_SRC } from '../utils'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type PrettierOptions = OptionsOverrides

/**
 * Prettier code formatting configuration
 *
 * @param options - Configuration options
 * @param options.overrides - Custom rule overrides
 * @returns ESLint config array
 */
export function prettier(options: PrettierOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  const files = [GLOB_SRC]

  return defineConfig([
    {
      name: 'prettier/rules',
      files,
      extends: [prettierConfig],
      rules: overrides,
    },
  ])
}
