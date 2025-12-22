import stylisticPlugin from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'

import { GLOB_SRC } from '../utils'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type StylisticOptions = OptionsOverrides

/**
 * Stylistic code style configuration
 *
 * Provides code style rules (indentation, quotes, commas, etc.)
 *
 * Philosophy:
 * - Minimal: No semicolons in TypeScript, single quotes, 2-space indent
 * - Consistent: Trailing commas in multiline, always parens for arrow functions, 1tbs brace style
 * - Aesthetic: Object spacing, JSX follows HTML double-quote tradition
 *
 * @param options - Configuration options
 * @param options.overrides - Custom rule overrides
 * @returns ESLint config array
 */
export function stylistic(options: StylisticOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  const files = [GLOB_SRC]

  return defineConfig([
    {
      name: 'stylistic/rules',
      files,
      extends: [
        stylisticPlugin.configs.customize({
          // === Base Format ===
          indent: 2, // Minimal: 2 spaces is sufficient
          semi: false, // Minimal: TypeScript doesn't need semicolons

          // === Quote Strategy ===
          quotes: 'single', // Aesthetic: Single quotes in JS, lighter
          quoteProps: 'consistent-as-needed', // Minimal: Quote only when needed, but be consistent

          // === Comma Strategy ===
          commaDangle: 'always-multiline', // Consistent: Trailing commas in multiline

          // === Parentheses Strategy ===
          arrowParens: true, // Consistent: Always parens for arrow functions
          blockSpacing: true, // Aesthetic: Spacing in single-line blocks { return true }

          // === Block Style ===
          braceStyle: '1tbs', // Consistent: Mainstream One True Brace Style

          // === JSX Support ===
          jsx: true, // Enable JSX-related rules
        }),
      ],
      rules: overrides,
    },
  ])
}
