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
 * File matching options
 */
export interface OptionsFiles {
  /**
   * Custom file glob patterns
   */
  files?: string[]
}

/**
 * TypeScript configuration options
 */
export interface OptionsTypeScript {
  tsconfigRootDir?: string
  allowDefaultProject?: string[]
  defaultProject?: string
}

/**
 * Tailwind CSS configuration options
 */
export interface OptionsTailwind {
  /**
   * Path to the Tailwind CSS entry file
   * @default 'src/global.css'
   */
  entryPoint?: string
  /**
   * Font size of the `<html>` element in pixels.
   * Used by `enforce-canonical-classes` to determine if arbitrary values can be replaced with predefined sizing scales.
   * @default 16
   */
  rootFontSize?: number
}

// ============================================================================
// Config option types
// ============================================================================

export type A11yOptions = OptionsFiles & OptionsOverrides

export interface BoundariesOptions extends OptionsFiles, OptionsOverrides {
  elements?: {
    type: string
    pattern: string | string[]
    capture?: string[]
    mode?: 'file' | 'folder' | 'full'
  }[]
  rules?: {
    from: string | string[]
    allow?: (string | [string, Record<string, string>])[]
    disallow?: string[]
    message?: string
  }[]
}

export interface DependOptions extends OptionsOverrides {
  /**
   * Preset list
   *
   * - `native`: Flags packages replaceable with native JavaScript APIs (e.g. `is-nan` → `Number.isNaN()`)
   * - `microutilities`: Flags micro-utility packages implementable in a single line
   * - `preferred`: Recommends lighter-weight, better-maintained alternatives
   *
   * @default ['native', 'microutilities', 'preferred']
   */
  presets?: ('native' | 'microutilities' | 'preferred')[]

  /**
   * Additional modules to ban
   * @default []
   */
  modules?: string[]

  /**
   * Modules to allow even if matched by a preset
   * @default []
   */
  allowed?: string[]
}

export interface IgnoresOptions {
  /** Additional ignore patterns to merge with DEFAULT_IGNORES; pass false to disable all global ignores */
  ignores?: string | string[] | false
  /** Whether to parse .gitignore and merge into global ignores @default true */
  gitignore?: boolean
}

export interface ImportsOptions extends OptionsOverrides {
  /**
   * Whether to enable TypeScript support
   * Automatically injected as true by composeConfig when the global typescript option is enabled
   * @default false (standalone) / follows global typescript option (via composeConfig)
   */
  typescript?: boolean
  /**
   * Disallow parent-relative imports (paths starting with ../)
   * @default false
   */
  noRelativeParentImports?: boolean
  /**
   * Root directory for tsconfig.json lookup; restricts resolver scope in monorepo to avoid cross-app roaming
   * Automatically injected by composeConfig from the global typescript.tsconfigRootDir option
   */
  tsconfigRootDir?: string
}

export type JavaScriptOptions = OptionsFiles & OptionsOverrides

export type JsdocOptions = OptionsOverrides

export type NextjsOptions = OptionsOverrides

export interface PackageJsonOptions extends OptionsOverrides {
  /**
   * @default true
   */
  stylistic?: boolean
  /**
   * @default false
   */
  enforceForPrivate?: boolean
}

export interface ReactOptions extends OptionsFiles, OptionsOverrides {
  /**
   * Whether to enable react-refresh plugin (for Vite projects).
   * @default false
   */
  vite?: boolean
}

export type StorybookOptions = OptionsOverrides

export type StylisticOptions = OptionsOverrides

export type TailwindOptions = OptionsFiles & OptionsOverrides & OptionsTailwind

export type TypeScriptOptions = OptionsFiles & OptionsOverrides & OptionsTypeScript

export type UnicornOptions = OptionsFiles & OptionsOverrides

export type VitestOptions = OptionsFiles & OptionsOverrides & {
  isInEditor?: boolean
}

export interface OxlintOptions {
  /**
   * Path to oxlint config file for dynamic rule generation.
   * When provided, uses `buildFromOxlintConfigFile()` instead of the `flat/recommended` preset.
   * @example './.oxlintrc.json'
   */
  configFile?: string
}
