import { GLOB_TESTS, composeConfig } from '@workspace/eslint-config'
import { defineConfig } from 'eslint/config'

import type { Linter } from 'eslint'

const appConfig: Linter.Config[] = defineConfig({
  extends: composeConfig({
    typescript: { tsconfigRootDir: import.meta.dirname },
    imports: {
      typescript: true,
    },
    react: true,
    unicorn: true,
    stylistic: true,
  }),
})

const vitestConfig: Linter.Config[] = defineConfig({
  files: GLOB_TESTS,
  extends: composeConfig({
    typescript: { tsconfigRootDir: import.meta.dirname },
    vitest: true,
    unicorn: false,
    stylistic: false,
    depend: false,
  }),
})

export default [...appConfig, ...vitestConfig]
