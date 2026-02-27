/**
 * ESLint ignore configuration with built-in default ignore patterns and .gitignore integration
 */
import { existsSync } from 'node:fs'
import path from 'node:path'

import { includeIgnoreFile } from '@eslint/compat'

import type { IgnoresOptions } from '../types'
import type { Linter } from 'eslint'

/**
 * Default ignored files and directories
 */
export const DEFAULT_IGNORES: string[] = [
  // Dependency directories
  '**/node_modules/**',
  '**/.pnp.*',

  // Build artifacts
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/.next/**',

  // Cache directories
  '**/.cache/**',
  '**/.turbo/**',
  '**/.eslintcache',

  // Version control
  '**/.git/**',
  '**/.svn/**',
  '**/.hg/**',
  '**/public/**',

  // Type declaration files
  '**/*.d.ts',
]

export function ignores(options: IgnoresOptions = {}): Linter.Config[] {
  const { ignores: userIgnores, gitignore: gitignorePath } = options
  const configs: Linter.Config[] = []

  if (gitignorePath !== false) {
    try {
      const gitignoreFile
        = typeof gitignorePath === 'string'
          ? path.resolve(gitignorePath)
          : path.resolve(process.cwd(), '.gitignore')

      if (existsSync(gitignoreFile)) {
        configs.push(includeIgnoreFile(gitignoreFile))
      }
    } catch {
      //
    }
  }

  const finalIgnores
    = userIgnores === false
      ? []
      : (userIgnores
          ? [...DEFAULT_IGNORES, ...userIgnores]
          : DEFAULT_IGNORES)

  if (finalIgnores.length > 0) {
    configs.push({
      name: 'defaults',
      ignores: finalIgnores,
    })
  }

  return configs.map((config) => ({
    ...config,
    name: `ignores/globals/${config.name}`,
  }))
}
