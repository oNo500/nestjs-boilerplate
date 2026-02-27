/**
 * Storybook ESLint configuration using the official plugin for best practices enforcement
 */
import { defineConfig } from 'eslint/config'
import storybookPlugin from 'eslint-plugin-storybook'

import type { StorybookOptions } from '../types'
import type { Linter } from 'eslint'

const flatRecommended = storybookPlugin.configs['flat/recommended'] as unknown as Linter.Config

export function storybook(options: StorybookOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig({
    name: 'storybook/recommended',
    extends: [flatRecommended],
    rules: {
      ...overrides,
    },
  })
}
