/**
 * ESLint ignore configuration with built-in default ignore patterns and .gitignore integration
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { convertIgnorePatternToMinimatch } from '@eslint/compat'
import { defineConfig, globalIgnores } from 'eslint/config'

import type { IgnoresOptions } from '../types'
import type { Linter } from 'eslint'

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
  const { ignores: userIgnores, gitignore = true } = options

  if (userIgnores === false) {
    return []
  }

  const gitignorePatterns: string[] = []
  if (gitignore) {
    const gitignoreFile = path.resolve(process.cwd(), '.gitignore')
    if (existsSync(gitignoreFile)) {
      const lines = readFileSync(gitignoreFile, 'utf8').split(/\r?\n/u)
      gitignorePatterns.push(
        ...lines
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .map((line) => convertIgnorePatternToMinimatch(line)),
      )
    }
  }

  const userPatterns = userIgnores
    ? (Array.isArray(userIgnores) ? userIgnores : [userIgnores])
    : []

  return defineConfig([
    globalIgnores(
      [...DEFAULT_IGNORES, ...gitignorePatterns, ...userPatterns],
      'ignores/globals/defaults',
    ),
  ])
}
