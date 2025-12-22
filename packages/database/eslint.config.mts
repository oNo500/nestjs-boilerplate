import { composeConfig } from '@workspace/eslint-config'

import type { Linter } from 'eslint'

const config: Linter.Config[] = composeConfig({
  typescript: {
    tsconfigRootDir: import.meta.dirname,
  },
})

export default config
