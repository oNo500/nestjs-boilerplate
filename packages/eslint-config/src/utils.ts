/**
 * Utility functions and constants
 */

// ============================================================================
// Environment detection
// ============================================================================

/**
 * Detects whether running inside Git Hooks or lint-staged
 */
function isInGitHooksOrLintStaged(): boolean {
  const envVars = [
    process.env['GIT_PARAMS'],
    process.env['VSCODE_GIT_COMMAND'],
  ]
  return envVars.some(Boolean) || process.env['npm_lifecycle_script']?.startsWith('lint-staged') === true
}

/**
 * Detects whether running in an editor environment
 *
 * Returns false when:
 * - CI environment
 * - Git Hooks
 * - lint-staged
 *
 * Returns true when:
 * - VSCode
 * - JetBrains IDE
 * - Vim / Neovim
 */
export function isInEditorEnv(): boolean {
  if (process.env['CI'])
    return false
  if (isInGitHooksOrLintStaged())
    return false
  const envVars = [
    process.env['VSCODE_PID'],
    process.env['VSCODE_CWD'],
    process.env['JETBRAINS_IDE'],
    process.env['VIM'],
    process.env['NVIM'],
  ]
  return envVars.some(Boolean)
}

// ============================================================================
// File matching patterns (Globs)
// ============================================================================

/**
 * ESLint file glob pattern constants
 *
 * Unified glob patterns to ensure consistent file matching across all configurations
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
