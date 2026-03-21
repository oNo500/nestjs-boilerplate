/**
 * React ESLint configuration integrating @eslint-react, react-hooks, and react-refresh plugins
 */
import reactPlugin from '@eslint-react/eslint-plugin'
import { defineConfig } from 'eslint/config'
// import reactHooksPlugin from 'eslint-plugin-react-hooks' // reactPlugin already includes reactHooksPlugin in newer versions
import reactRefresh from 'eslint-plugin-react-refresh'

import { GLOB_JSX } from '../utils'

import type { ReactOptions } from '../types'
import type { Linter } from 'eslint'

/**
 * React rule configuration
 */
export function react(options: ReactOptions = {}): Linter.Config[] {
  const { files = [GLOB_JSX], overrides = {}, vite = false } = options

  return defineConfig({
    name: 'react/rules',
    files,
    extends: [
      reactPlugin.configs['recommended-type-checked'],
      // reactHooksPlugin.configs.flat['recommended-latest'],
      ...(vite ? [reactRefresh.configs.recommended] : []),
    ],
    rules: {
      // attributes: false allows passing async functions to JSX event attributes (e.g. onClick), which is valid in React
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      ...overrides,
    },
  })
}
