/**
 * React ESLint configuration integrating @eslint-react, react-hooks, and react-refresh plugins
 */
import reactPlugin from '@eslint-react/eslint-plugin'
import { defineConfig } from 'eslint/config'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
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
      reactPlugin.configs['recommended-typescript'],
      reactHooksPlugin.configs.flat['recommended-latest'],
      ...(vite ? [reactRefresh.configs.recommended] : []),
    ],
    rules: {
      ...overrides,
    },
  })
}
