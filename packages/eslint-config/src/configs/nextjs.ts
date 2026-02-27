/**
 * Next.js ESLint configuration using the official plugin for best practices and Core Web Vitals enforcement
 */
import nextjsPlugin from '@next/eslint-plugin-next'
import { defineConfig } from 'eslint/config'

import type { NextjsOptions } from '../types'
import type { Linter } from 'eslint'

const recommended = nextjsPlugin.configs.recommended as unknown as Linter.Config
const coreWebVitals = nextjsPlugin.configs['core-web-vitals'] as unknown as Linter.Config

/**
 * Next.js rule configuration
 */
export function nextjs(options: NextjsOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig({
    name: 'nextjs/rules',
    extends: [recommended, coreWebVitals],
    rules: overrides,
  })
}
