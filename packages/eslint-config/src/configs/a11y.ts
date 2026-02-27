/**
 * eslint-plugin-jsx-a11y configuration for detecting accessibility issues in JSX (WCAG standard)
 */
import { defineConfig } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'

import { GLOB_JSX } from '../utils'

import type { A11yOptions } from '../types'
import type { Linter } from 'eslint'

/**
 * Accessibility rule configuration
 */
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
