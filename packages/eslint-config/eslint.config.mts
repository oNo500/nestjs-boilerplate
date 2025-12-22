import { composeConfig } from './src/index'

import type { Linter } from 'eslint'

const config: Linter.Config [] = composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  imports: { typescript: true },
})
export default config
