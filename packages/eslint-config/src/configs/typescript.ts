import { defineConfig } from 'eslint/config'
import { configs, parser, plugin } from 'typescript-eslint'

import { GLOB_TS } from '../utils'

import type { OptionsFiles, OptionsOverrides, OptionsTypeScript } from '../types'
import type { Linter } from 'eslint'

export type TypeScriptOptions = OptionsFiles & OptionsOverrides & OptionsTypeScript

export function typescript(options: TypeScriptOptions = {}): Linter.Config[] {
  const { files = [GLOB_TS], tsconfigRootDir, overrides = {} } = options

  return defineConfig({
    name: 'typescript/rules',
    files,
    plugins: {
      '@typescript-eslint': plugin,
    },
    extends: [configs.recommendedTypeChecked, configs.stylisticTypeChecked],
    // For global variables in TS, disable ESLint's `no-undef` rule
    // Reference: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
    languageOptions: {
      parser: parser,
      parserOptions: {
        projectService: true,
        // Default process.cwd() may cause inconsistent behavior (depends on execution directory)
        // Highly recommend explicit: typescript({ tsconfigRootDir: import.meta.dirname })
        tsconfigRootDir: tsconfigRootDir ?? process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      // Stylistic
      '@typescript-eslint/no-unused-vars': 'off', // Works with tsconfig.verbatimModuleSyntax, e.g., `import type {ReactNode} from 'react'`
      // Deprecated API detection (replaces eslint-plugin-n's no-deprecated-api)
      '@typescript-eslint/no-deprecated': 'warn',
      // Disable no-inferrable-types because project uses isolatedDeclarations
      // TypeScript's isolatedDeclarations requires explicit type annotations for exports
      // Reference: https://typescript-eslint.io/rules/no-inferrable-types/#when-not-to-use-it
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false, // Allow returning Promise in JSX attributes
          },
        },
      ],

      ...overrides,
    },
  })
}
