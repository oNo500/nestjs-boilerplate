/**
 * Tailwind CSS ESLint configuration using the official recommended ruleset
 */
import { defineConfig } from 'eslint/config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

import { GLOB_JSX } from '../utils'

import type { TailwindOptions } from '../types'
import type { Linter } from 'eslint'

/**
 * Tailwind CSS rule configuration
 */
export function tailwind(options: TailwindOptions = {}): Linter.Config[] {
  const { files = [GLOB_JSX], overrides = {}, entryPoint = 'src/styles/globals.css', rootFontSize } = options

  if (rootFontSize === undefined) {
    console.warn(
      '[eslint-config] tailwind: `rootFontSize` is not set. '
      + 'This affects `enforce-canonical-classes` — set it to your `<html>` font size (usually 16). '
      + 'Defaulting to 16.',
    )
  }

  return defineConfig({
    name: 'tailwind/rules',
    files,
    extends: [
      eslintPluginBetterTailwindcss.configs.recommended,
    ],
    rules: {
      'better-tailwindcss/enforce-consistent-line-wrapping': ['error', { printWidth: 0 }],
      'better-tailwindcss/enforce-canonical-classes': 'error',
      ...overrides,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint,
        rootFontSize: rootFontSize ?? 16,
      },
    },
  })
}
