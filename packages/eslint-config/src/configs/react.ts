import reactPlugin from '@eslint-react/eslint-plugin'
import { defineConfig } from 'eslint/config'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

import { GLOB_JSX } from '../utils'

import type { OptionsFiles, OptionsOverrides, OptionsReact } from '../types'
import type { Linter } from 'eslint'

export type ReactOptions = OptionsFiles & OptionsOverrides & OptionsReact

export function react(options: ReactOptions = {}): Linter.Config[] {
  const { files = [GLOB_JSX], version = 'detect', overrides = {} } = options

  return defineConfig({
    name: 'react/rules',
    files,
    extends: [
      reactPlugin.configs['recommended-typescript'],
      reactHooksPlugin.configs.flat['recommended-latest'],
      reactRefresh.configs.recommended,
    ],
    settings: {
      react: {
        version,
      },
    },
    rules: {
      ...overrides,
    },
  })
}
