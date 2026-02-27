/**
 * Prettier code formatting configuration using the official recommended ruleset
 */
import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-plugin-prettier/recommended'

import { GLOB_SRC } from '../utils'

import type { PrettierOptions } from '../types'
import type { Linter } from 'eslint'

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
