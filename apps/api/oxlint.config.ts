import { base, depend, drizzle, node, promise, unicorn, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base(),
    unicorn(),
    depend(),
    node(),
    promise(),
    drizzle({
      rules: {
        'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: 'db' }],
        'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: 'db' }],
      },
    }),
    vitest({ files: ['**/*.{test,spec}.ts', '**/*.e2e-spec.ts', '**/__tests__/**/*.ts'] }),
  ],
  rules: {
    // NestJS exception filter .catch() is not Promise.catch()
    'promise/valid-params': 'off',
  },
  overrides: [
    {
      files: ['**/*.{ts,mts,cts,tsx}'],
      rules: {
        // NestJS empty decorated classes are valid (modules, controllers)
        'typescript/no-extraneous-class': ['error', { allowWithDecorator: true }],
        // NestJS DI requires runtime class references — disable without type-aware linting
        'typescript/consistent-type-imports': 'off',
      },
    },
    {
      // DTO files conventionally bundle related request/response classes;
      // test files declare e2e fixtures and helper classes inline.
      files: ['**/dtos/**/*.ts', '**/__tests__/**/*.ts', '**/*.e2e-spec.ts'],
      rules: {
        'max-classes-per-file': 'off',
      },
    },
  ],
})
