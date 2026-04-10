import { base, depend, nextjs, react, unicorn, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base({
      rules: {
        // CSS side-effect imports are valid in Next.js
        'import/no-unassigned-import': 'off',
      },
    }),
    unicorn(),
    depend(),
    react({
      rules: {
        // Next.js uses the automatic JSX runtime
        'react/react-in-jsx-scope': 'off',
      },
    }),
    nextjs(),
    vitest({
      files: ['**/*.{test,spec}.ts', '**/*.{test,spec}.tsx', '**/__tests__/**/*.ts'],
      rules: {
        // Test setup mocks don't need explicit type parameters
        'vitest/require-mock-type-parameters': 'off',
      },
    }),
  ],
})
