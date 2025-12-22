import { importX } from 'eslint-plugin-import-x'

import { GLOB_SRC } from '../utils'

import type { OptionsOverrides, OptionsStylistic } from '../types'
import type { Linter } from 'eslint'

/**
 * Import configuration options
 *
 * When TypeScript is enabled:
 * - Auto-disables rules duplicated by TypeScript compiler for better performance
 * - Enables eslint-import-resolver-typescript resolver
 * - Supports tsconfig paths, @types, and other TypeScript features
 */
export interface ImportsOptions extends OptionsOverrides, OptionsStylistic {
  /**
   * Enable TypeScript support
   * @default false
   */
  typescript?: boolean
}

/**
 * Import-related rules configuration
 *
 * @param options - Configuration options
 * @param options.typescript - Enable TypeScript support (requires eslint-import-resolver-typescript)
 * @param options.stylistic - Enable stylistic rules (e.g., newline-after-import)
 * @param options.overrides - Custom rule overrides
 * @returns ESLint config array
 *
 * TODO: Need to research if supporting react-native, electron, etc. resolution rules
 */
export function imports(options: ImportsOptions = {}): Linter.Config[] {
  const { overrides = {}, stylistic = true, typescript = false } = options

  const files = [GLOB_SRC]

  return [
    {
      name: 'imports/rules',
      files,
      plugins: {
        'import-x': importX as unknown,
      },
      // Conditionally add TypeScript support
      settings: {
        ...(typescript
          ? {
              ...importX.configs['flat/recommended'].settings,
              // Override resolver config, Bun support enabled by default
              'import-x/resolver': {
                typescript: {
                  alwaysTryTypes: true, // Try to find `<root>@types` directory
                },
              },
            }
          : {}),
      },
      rules: {
        ...importX.configs['flat/recommended'].rules,
        ...(typescript ? importX.configs['flat/typescript'].rules : {}),

        // TypeScript optimization: Disable rules duplicated by tsc
        // Reference: https://github.com/un-ts/eslint-plugin-import-x#typescript
        ...(typescript
          ? {
              'import-x/named': 'off', // TS already checks exports
              'import-x/namespace': 'off', // TS already checks namespaces
              'import-x/default': 'off', // TS already checks default exports
              'import-x/no-named-as-default-member': 'off', // TS already checks member access
              'import-x/no-unresolved': 'off', // TS already checks module resolution (when using import)
            }
          : {}),

        // Stylistic rules (optional)
        ...(stylistic
          ? {
              'import-x/newline-after-import': ['error', { count: 1 }],
              'import-x/order': [
                'error',
                {
                  'groups': [
                    'builtin', // Node.js built-in modules (fs, path, etc.)
                    'external', // npm packages
                    'internal', // Internal modules (@/ alias)
                    ['parent', 'sibling'], // Relative imports (../, ./)
                    'index', // Index files (./)
                    'type', // Type imports
                  ],
                  'newlines-between': 'always', // Blank lines between groups
                  'alphabetize': {
                    order: 'asc', // Ascending alphabetical order
                    caseInsensitive: true, // Ignore case
                  },
                  'pathGroups': [
                    {
                      pattern: '@/**', // @ alias paths
                      group: 'internal',
                      position: 'before',
                    },
                  ],
                  'pathGroupsExcludedImportTypes': ['type'], // Type imports not affected by pathGroups
                  'distinctGroup': true, // Group type imports separately
                },
              ],
            }
          : {}),
        'import-x/consistent-type-specifier-style': 'error',

        // Following rules have no TS equivalent but high performance cost, recommend CI-only:
        'import-x/no-named-as-default': 'warn', // Check default import vs named export conflicts
        'import-x/no-cycle': 'error', // Check circular dependencies
        'import-x/no-unused-modules': 'error', // Check unused modules
        'import-x/no-deprecated': 'warn', // Check deprecated imports
        'import-x/no-extraneous-dependencies': 'error', // Check undeclared dependencies (replaces eslint-plugin-n's no-extraneous-import)

        // TODO: May need to enable for vertical slice architecture
        'import-x/no-relative-parent-imports': 'off',
        'import-x/no-internal-modules': 'off',

        // User custom overrides (applied last, highest priority)
        ...overrides,
      },
    } as Linter.Config,
  ]
}
