import { defineConfig } from 'eslint/config'
import storybookPlugin from 'eslint-plugin-storybook'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type StorybookOptions = OptionsOverrides

/**
 * Storybook rules configuration
 *
 * Extends eslint-plugin-storybook flat/recommended config
 *
 * @see https://github.com/storybookjs/eslint-plugin-storybook
 *
 * @param options - Config options
 * @param options.overrides - Custom rule overrides
 * @returns ESLint config array
 */
export function storybook(options: StorybookOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig([
    {
      name: 'storybook/recommended',
      extends: [storybookPlugin.configs['flat/recommended'] as unknown as Linter.Config],
      rules: {
        ...overrides,
      },
    },
  ])
}
