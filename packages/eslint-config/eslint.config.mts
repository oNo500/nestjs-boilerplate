import { composeConfig } from './src/index'

import type { Linter } from 'eslint'

const config: Linter.Config[] = composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  imports: {
    overrides: {
      // This package uses relative imports internally since no path aliases are configured
      'no-restricted-imports': 'off',
    },
  },
})
export default config
