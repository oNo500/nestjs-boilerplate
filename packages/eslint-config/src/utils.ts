/**
 * Utility functions and constants
 */

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Detect if running in Git Hooks or lint-staged
 */
function isInGitHooksOrLintStaged(): boolean {
  return !!(
    process.env['GIT_PARAMS']
    ?? process.env['VSCODE_GIT_COMMAND']
    ?? process.env['npm_lifecycle_script']?.startsWith('lint-staged')
  )
}

/**
 * Detect if running in editor environment
 *
 * Returns false when in:
 * - CI environment
 * - Git Hooks
 * - lint-staged
 *
 * Returns true when in:
 * - VSCode
 * - JetBrains IDE
 * - Vim / Neovim
 */
export function isInEditorEnv(): boolean {
  if (process.env['CI'])
    return false
  if (isInGitHooksOrLintStaged())
    return false
  return !!(
    process.env['VSCODE_PID']
    ?? process.env['VSCODE_CWD']
    ?? process.env['JETBRAINS_IDE']
    ?? process.env['VIM']
    ?? process.env['NVIM']
  )
}

// ============================================================================
// File Matching Patterns (Globs)
// ============================================================================

/**
 * ESLint file matching pattern constants
 *
 * Unified glob patterns ensuring consistent file matching across all configs
 */

/** All JS/TS source files (full ESM/CJS coverage) */
export const GLOB_SRC = '**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'

/** JavaScript files only */
export const GLOB_JS = '**/*.{js,mjs,cjs,jsx}'

/** TypeScript files only */
export const GLOB_TS = '**/*.{ts,mts,cts,tsx}'

/** JSX/TSX files (React-related) */
export const GLOB_JSX = '**/*.{jsx,tsx}'

/** Test files */
export const GLOB_TESTS: string[] = [
  '**/*.{test,spec}.{js,mjs,cjs,jsx,ts,mts,cts,tsx}',
  '**/__tests__/**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}',
]

/** JSON files */
export const GLOB_JSON = '**/*.json'

/** Markdown files */
export const GLOB_MARKDOWN = '**/*.md'
