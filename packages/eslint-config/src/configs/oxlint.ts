/**
 * Oxlint integration — disables ESLint rules already covered by oxlint
 * to avoid duplicate checking when running both linters in parallel.
 */
import oxlint from 'eslint-plugin-oxlint'

import type { OxlintOptions } from '../types'
import type { Linter } from 'eslint'

export function oxlintConfig(options: OxlintOptions = {}): Linter.Config[] {
  const { configFile } = options

  return configFile
    ? oxlint.buildFromOxlintConfigFile(configFile)
    : [...oxlint.configs['flat/recommended']]
}
