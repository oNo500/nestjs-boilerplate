import {
  base,
  boundaries,
  node,
  promise,
  unicorn,
  vitest,
} from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base,
    unicorn,
    node,
    promise,
    vitest,
    boundaries({
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
          from: ['module'],
          allow: [
            'shared-kernel',
            'app',
            ['module', { moduleName: '${moduleName}' }],
          ],
          message: 'Cross-module imports are forbidden. Share code via shared-kernel or decouple through events.',
        },
        {
          from: ['shared-kernel'],
          allow: ['shared-kernel', 'app'],
          message: 'shared-kernel must not import business modules',
        },
        {
          from: ['app'],
          allow: ['app', 'shared-kernel'],
          message: 'The app layer should not directly depend on business modules',
        },
        {
          from: ['main'],
          allow: ['module', 'shared-kernel', 'app', 'main'],
        },
      ],
    }),
  ],
  jsPlugins: ['eslint-plugin-drizzle'],
  rules: {
    // Drizzle: only check direct db calls, not service wrappers
    'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: 'db' }],
    'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: 'db' }],

    // Promise.catch false positive — NestJS exception filter .catch() is not Promise.catch()
    'promise/valid-params': 'off',
  },
  overrides: [
    {
      files: ['**/*.{ts,mts,cts,tsx}'],
      rules: {
        // NestJS empty decorated classes are valid (modules, controllers)
        'typescript/no-extraneous-class': ['error', { allowWithDecorator: true }],

        // NestJS DI requires runtime class references in constructor params.
        // Without type-aware linting, this rule incorrectly converts DI imports to type-only.
        'typescript/consistent-type-imports': 'off',
      },
    },
  ],
})
