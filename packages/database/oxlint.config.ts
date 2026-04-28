import { base, depend, drizzle, node, unicorn } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base(),
    unicorn(),
    depend(),
    node(),
    drizzle({
      rules: {
        'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: 'db' }],
        'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: 'db' }],
      },
    }),
  ],
  overrides: [
    {
      files: ['scripts/**/*.ts'],
      rules: {
        'typescript/no-explicit-any': 'off',
        // Scripts intentionally reach into src/ via relative paths.
        'import/no-relative-parent-imports': 'off',
      },
    },
    {
      // Drizzle Kit does not resolve tsconfig path aliases for schema files.
      // Schemas must reference each other via relative paths.
      files: ['src/schemas/**/*.ts'],
      rules: {
        'import/no-relative-parent-imports': 'off',
      },
    },
  ],
})
