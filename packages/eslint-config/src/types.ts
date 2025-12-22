import type { RulesConfig } from '@eslint/core'

/**
 * Rule override options
 */
export interface OptionsOverrides {
  /**
   * Custom rule overrides
   */
  overrides?: Partial<RulesConfig>
}

/**
 * Stylistic options
 */
export interface OptionsStylistic {
  /**
   * Enable stylistic rules
   * @default true
   */
  stylistic?: boolean
}

/**
 * File matching options
 */
export interface OptionsFiles {
  /**
   * Custom file patterns
   */
  files?: string[]
}

/**
 * TypeScript configuration options
 */
export interface OptionsTypeScript {
  /**
   * Root directory path containing tsconfig.json
   *
   * **Important: Highly recommend setting this explicitly!**
   *
   * If not set, TypeScript ESLint defaults to `process.cwd()`,
   * which causes:
   *
   * 1. **Unstable behavior**: ESLint behavior depends on execution directory
   * 2. **Inconsistent across environments**: Different results when run from different directories
   * 3. **IDE integration issues**: Editor and CLI may have different working directories, breaking type checking
   * 4. **Poor monorepo compatibility**: Hard to locate correct tsconfig.json in monorepos
   *
   * **Recommended usage:**
   * ```typescript
   * // In ESLint config file
   * export default [
   *   ...typescript({
   *     tsconfigRootDir: import.meta.dirname  // ✅ Recommended: use config file directory
   *   })
   * ]
   * ```
   *
   * @example
   * ```typescript
   * // ✅ Recommended: Explicitly set to config file directory
   * typescript({
   *   tsconfigRootDir: import.meta.dirname
   * })
   *
   * // ❌ Not recommended: Relies on process.cwd() (default behavior)
   * typescript({
   *   // tsconfigRootDir not set
   * })
   * ```
   */
  tsconfigRootDir?: string
}

/**
 * React configuration options
 */
export interface OptionsReact {
  /**
   * React version
   * @default 'detect'
   */
  version?: string
}
