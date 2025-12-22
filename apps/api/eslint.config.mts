import { composeConfig } from '@workspace/eslint-config'

const baseConfig = composeConfig({
  typescript: {
    tsconfigRootDir: import.meta.dirname,
  },
  prettier: false,
  packageJson: {
    overrides: {
      'package-json/valid-devDependencies': 'off', // Allow link: local deps
    },
  },
  vitest: true,
  // Enable module boundary checks for VSA/DDD
  boundaries: {
    preset: 'modules',
  },
  unicorn: {
    overrides: {
      'unicorn/no-null': 'off', // Drizzle returns null
    },
  },
  // Disallow ../ relative imports, use @/ alias
  imports: {
    overrides: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../**'],
              message: 'Use @/ path alias instead of ../ relative imports',
            },
          ],
        },
      ],
    },
  },
})

// Schema exception: Drizzle Kit requires relative imports
export default [
  ...baseConfig,
  {
    files: ['**/schemas/*.schema.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // Allow auth module to depend on profile module
  {
    files: ['src/modules/auth/**/*.ts'],
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Auth can import profile (one-way dependency)
            {
              from: ['module'],
              allow: [
                'app',
                'shared-kernel',
                ['module', { moduleName: 'auth' }],
                ['module', { moduleName: 'profile' }],
              ],
            },
          ],
        },
      ],
    },
  },
]
