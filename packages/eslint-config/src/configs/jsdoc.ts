import { defineConfig } from 'eslint/config'
import jsdocPlugin from 'eslint-plugin-jsdoc'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type JsdocOptions = OptionsOverrides

/**
 * JSDoc documentation standards configuration
 *
 * Uses TypeScript-optimized recommended rules to validate JSDoc correctness and consistency
 *
 * @param options - Configuration options
 * @param options.overrides - Custom rule overrides
 * @returns ESLint config array
 */
export function jsdoc(options: JsdocOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig([
    {
      name: 'jsdoc/rules',
      extends: [jsdocPlugin.configs['flat/contents-typescript']],
      rules: {
        // Disabled: Rule designed for English comments, not suitable for non-English projects
        'jsdoc/match-description': 'off',
        // Disabled: Rule's semantic analysis inaccurate for non-English comments
        'jsdoc/informative-docs': 'off',
        ...overrides,
      },
    },
  ])
}
