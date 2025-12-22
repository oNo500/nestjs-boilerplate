import { defineConfig } from 'eslint/config'
import boundariesPlugin from 'eslint-plugin-boundaries'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

/**
 * Preset types
 */
type BoundaryPreset = 'modules' | 'layers'

/**
 * Element type definition
 */
interface ElementType {
  /**
   * Element type name
   */
  type: string
  /**
   * Match pattern (supports minimatch glob)
   */
  pattern: string | string[]
  /**
   * Capture groups for extracting variables
   */
  capture?: string[]
  /**
   * Main entry point mode
   */
  mode?: 'file' | 'folder' | 'full'
}

/**
 * Rule configuration
 */
interface BoundaryRule {
  /**
   * Source element
   */
  from: string | string[]
  /**
   * Allowed target elements
   * Supports string or [elementType, { captureGroup: 'value' }] format
   */
  allow?: (string | [string, Record<string, string>])[]
  /**
   * Disallowed target elements
   */
  disallow?: string[]
  /**
   * Rule message
   */
  message?: string
}

export interface BoundariesOptions extends OptionsOverrides {
  /**
   * Use preset configuration
   * - 'modules': VSA/DDD module boundaries (modules cannot import each other)
   * - 'layers': Layered architecture (controls layer dependency direction)
   */
  preset?: BoundaryPreset
  /**
   * Custom element type definitions
   * Auto-generated when using preset, or fully customizable
   */
  elements?: ElementType[]
  /**
   * Custom boundary rules
   * Auto-generated when using preset, or fully customizable
   */
  rules?: BoundaryRule[]
  /**
   * File matching patterns
   */
  files?: string[]
  /**
   * Base directory (for resolver)
   * @default process.cwd()
   */
  baseDirectory?: string
}

/**
 * Get modules preset configuration
 * VSA/DDD style: modules cannot import each other, only shared-kernel and app
 */
function getModulesPreset(): {
  elements: ElementType[]
  rules: BoundaryRule[]
} {
  return {
    elements: [
      {
        type: 'module',
        pattern: 'src/modules/*/**',
        capture: ['moduleName'],
        mode: 'folder',
      },
      {
        type: 'shared-kernel',
        pattern: 'src/shared-kernel/**',
        mode: 'folder',
      },
      {
        type: 'app',
        pattern: 'src/app/**',
        mode: 'folder',
      },
      {
        type: 'main',
        pattern: ['src/main.ts', 'src/*.module.ts', 'src/*.d.ts'],
        mode: 'file',
      },
    ],
    rules: [
      {
        // Modules can only import: same module, shared-kernel, app
        from: ['module'],
        allow: [
          // Allow same module imports (matched via ${moduleName} capture group)
          ['module', { moduleName: '${moduleName}' }],
          'shared-kernel',
          'app',
          'main',
        ],
        message: 'Modules cannot import each other. Use shared-kernel for shared code or decouple via events',
      },
      {
        // shared-kernel can import itself and app (infrastructure may need app config)
        from: ['shared-kernel'],
        allow: ['shared-kernel', 'app'],
        message: 'shared-kernel cannot import business modules',
      },
      {
        // app can import shared-kernel, but not business modules
        from: ['app'],
        allow: ['app', 'shared-kernel'],
        message: 'app layer should not directly depend on business modules',
      },
      {
        // main can import anything
        from: ['main'],
        allow: ['module', 'shared-kernel', 'app', 'main'],
      },
    ],
  }
}

/**
 * Get layers preset configuration
 * Layered architecture: presentation → application → domain, infrastructure → application
 */
function getLayersPreset(): {
  elements: ElementType[]
  rules: BoundaryRule[]
} {
  return {
    elements: [
      {
        type: 'domain',
        pattern: 'src/**/domain/**',
        mode: 'folder',
      },
      {
        type: 'application',
        pattern: 'src/**/application/**',
        mode: 'folder',
      },
      {
        type: 'infrastructure',
        pattern: 'src/**/infrastructure/**',
        mode: 'folder',
      },
      {
        type: 'presentation',
        pattern: 'src/**/presentation/**',
        mode: 'folder',
      },
    ],
    rules: [
      {
        // Domain layer has zero dependencies
        from: ['domain'],
        allow: ['domain'],
        disallow: ['application', 'infrastructure', 'presentation'],
        message: 'Domain layer must have zero dependencies and cannot import other layers',
      },
      {
        // Application layer can import domain
        from: ['application'],
        allow: ['domain', 'application'],
        disallow: ['infrastructure', 'presentation'],
        message: 'Application layer can only import domain layer',
      },
      {
        // Infrastructure implements application interfaces
        from: ['infrastructure'],
        allow: ['domain', 'application', 'infrastructure'],
        disallow: ['presentation'],
        message: 'Infrastructure layer cannot import presentation layer',
      },
      {
        // Presentation depends on application
        from: ['presentation'],
        allow: ['domain', 'application', 'presentation'],
        disallow: ['infrastructure'],
        message: 'Presentation layer cannot directly import infrastructure layer',
      },
    ],
  }
}

/**
 * eslint-plugin-boundaries configuration
 *
 * Enforces module boundaries and layered architecture rules
 * Supports VSA/DDD style module isolation
 *
 * @example
 * ```typescript
 * // Use modules preset
 * export default composeConfig({
 *   boundaries: {
 *     preset: 'modules'
 *   }
 * })
 *
 * // Custom rules
 * export default composeConfig({
 *   boundaries: {
 *     elements: [...],
 *     rules: [...]
 *   }
 * })
 * ```
 *
 * @param options - Configuration options
 * @returns ESLint config array
 */
export function boundaries(options: BoundariesOptions = {}): Linter.Config[] {
  const {
    preset,
    elements: customElements,
    rules: customRules,
    files = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    overrides = {},
    baseDirectory,
  } = options

  // Get preset configuration
  let elements: ElementType[] = []
  let rules: BoundaryRule[] = []

  if (preset === 'modules') {
    const presetConfig = getModulesPreset()
    elements = presetConfig.elements
    rules = presetConfig.rules
  } else if (preset === 'layers') {
    const presetConfig = getLayersPreset()
    elements = presetConfig.elements
    rules = presetConfig.rules
  }

  // Custom config overrides preset
  if (customElements) {
    elements = customElements
  }
  if (customRules) {
    rules = customRules
  }

  // Return empty array if no config
  if (elements.length === 0) {
    return []
  }

  return defineConfig([
    {
      name: 'boundaries/rules',
      files,
      plugins: {
        boundaries: boundariesPlugin,
      },
      settings: {
        'boundaries/elements': elements,
        'boundaries/dependency-nodes': ['import', 'dynamic-import'],
        // Ignore test files
        'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
        // Configure TypeScript path resolver
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            ...(baseDirectory && { project: baseDirectory }),
          },
        },
      },
      rules: {
        // Core rule: element boundary checking
        'boundaries/element-types': [
          'error',
          {
            default: 'disallow',
            rules: rules.map((rule) => ({
              from: Array.isArray(rule.from) ? rule.from : [rule.from],
              allow: rule.allow
                ? (Array.isArray(rule.allow) ? rule.allow : [rule.allow])
                : undefined,
              message: rule.message,
            })),
          },
        ],

        // Prevent external modules from importing private elements
        'boundaries/no-private': 'error',

        // Prevent unknown files (not matching any element definition)
        // Note: Disabled because .d.ts and config files may not match element definitions
        'boundaries/no-unknown-files': 'off',

        // Prevent unknown imports (importing files not matching any element)
        // Note: Disabled because external dependencies (node_modules) trigger false positives
        'boundaries/no-unknown': 'off',

        ...overrides,
      },
    },
  ])
}
