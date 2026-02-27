import { composeConfig } from '@workspace/eslint-config'

import type { Linter } from 'eslint'

const config: Linter.Config[] = [
  ...composeConfig({
    typescript: {
      tsconfigRootDir: import.meta.dirname,
    },
  }),
  {
    files: ['scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
]

export default config
