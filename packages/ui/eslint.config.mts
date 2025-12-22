import { composeConfig } from '@workspace/eslint-config'

import type { Linter } from 'eslint'

const codeConfig: Linter.Config[] = composeConfig({
  typescript: {
    tsconfigRootDir: import.meta.dirname,
  },
  react: true,
})

const config: Linter.Config[] = [
  {
    ignores: ['.storybook/**'],
  },
  ...codeConfig,
  {
    files: ['src/components/**/*.tsx', 'src/blocks/**/*.tsx'],
    rules: {
      // Components export both component and variants constants (e.g., buttonVariants, rootLayoutVariants)
      // UI component library doesn't need Fast Refresh, disable this rule
      'react-refresh/only-export-components': 'off',
    },
  },
]

export default config
