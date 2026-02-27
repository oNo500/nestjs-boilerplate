/**
 * package.json rule configuration for file consistency checks, field validation, and dependency management
 */
import { defineConfig } from 'eslint/config'
import plugin from 'eslint-plugin-package-json'

import type { PackageJsonOptions } from '../types'
import type { Linter } from 'eslint'

export function packageJson(options: PackageJsonOptions = {}): Linter.Config[] {
  const { stylistic = true, enforceForPrivate, overrides = {} } = options

  return defineConfig({
    name: 'package-json/rules',
    plugins: {
      'package-json': plugin,
    },
    extends: [plugin.configs.recommended],
    rules: {
      ...(stylistic ? plugin.configs.stylistic.rules : {}),
      'package-json/valid-local-dependency': 'off',
      ...overrides,
    },
    ...(enforceForPrivate !== undefined && {
      settings: {
        packageJson: {
          enforceForPrivate,
        },
      },
    }),
  })
}
