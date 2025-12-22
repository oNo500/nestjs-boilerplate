import { existsSync } from 'node:fs'
import path from 'node:path'

import { includeIgnoreFile } from '@eslint/compat'

import type { Linter } from 'eslint'

/**
 * Default ignored files and directories
 */
export const DEFAULT_IGNORES: string[] = [
  // Dependencies
  '**/node_modules/**',
  '**/.pnp.*',

  // Build outputs
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

  // Type files
  '**/*.d.ts',
]

/**
 * Ignore files configuration
 *
 * @param userIgnores - Array to extend defaults, or false to disable defaults
 * @param gitignorePath - gitignore file path or enable flag
 *   - true: Auto-find .gitignore in project root (default)
 *   - string: Use gitignore at specified path
 *   - false: Disable gitignore import
 * @returns ESLint config array
 */
export function ignores(
  userIgnores?: string[] | false,
  gitignorePath?: string | boolean,
): Linter.Config[] {
  const configs: Linter.Config[] = []

  // Handle gitignore import
  if (gitignorePath !== false) {
    try {
      // Use ternary instead of if-else
      const gitignoreFile
        = typeof gitignorePath === 'string'
          ? path.resolve(gitignorePath) // Use specified path
          : path.resolve(process.cwd(), '.gitignore') // Default: find in project root

      // Import only if file exists
      if (existsSync(gitignoreFile)) {
        configs.push(includeIgnoreFile(gitignoreFile))
      }
    } catch {
      // Silently skip errors to ensure config is always valid
    }
  }

  // Handle default and user-defined ignore rules
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

/**
 * Ignores configuration options
 */
export interface IgnoresOptions {
  /** Custom ignore rules, or false to disable defaults */
  ignores?: string[] | false
  /** gitignore file path or enable flag */
  gitignore?: string | boolean
}
