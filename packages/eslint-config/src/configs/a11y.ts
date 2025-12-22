import { defineConfig } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'

import { GLOB_JSX } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type A11yOptions = OptionsFiles & OptionsOverrides

export function a11y(options: A11yOptions = {}): Linter.Config[] {
  const { files = [GLOB_JSX], overrides = {} } = options

  return defineConfig({
    name: 'a11y/rules',
    files,
    extends: [jsxA11y.flatConfigs.recommended],
    rules: {
      ...overrides,
    },
  })
}
