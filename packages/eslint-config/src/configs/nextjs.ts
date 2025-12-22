import nextjsPlugin from '@next/eslint-plugin-next'
import { defineConfig } from 'eslint/config'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type NextjsOptions = OptionsOverrides

export function nextjs(options: NextjsOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig([
    {
      name: 'nextjs/rules',
      extends: [nextjsPlugin.configs.recommended as unknown as Linter.Config, nextjsPlugin.configs['core-web-vitals'] as unknown as Linter.Config],
      rules: overrides,
    },
  ])
}
