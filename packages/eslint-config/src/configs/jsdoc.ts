/**
 * JSDoc comment validation configuration using TypeScript-optimized recommended rules
 */
import { defineConfig } from 'eslint/config'
import jsdocPlugin from 'eslint-plugin-jsdoc'

import type { JsdocOptions } from '../types'
import type { Linter } from 'eslint'

export function jsdoc(options: JsdocOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig([
    {
      name: 'jsdoc/rules',
      extends: [jsdocPlugin.configs['flat/contents-typescript']],
      rules: {
        'jsdoc/match-description': 'off',
        'jsdoc/informative-docs': 'off',
        ...overrides,
      },
    },
  ])
}
