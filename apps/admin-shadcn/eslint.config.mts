import { GLOB_TESTS } from "@workspace/eslint-config";
import { composeConfig } from "@workspace/eslint-config";

import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";

const appConfig : Linter.Config[] = defineConfig({
  // ignores:GLOB_TESTS,
  extends: composeConfig({
      typescript: { tsconfigRootDir: import.meta.dirname },
      imports: {
        typescript: true,
      },
      nextjs: true,
      react: true,
      unicorn: true,
      stylistic: true,
    })
})
const vitestConfig:Linter.Config[] =defineConfig({
  files:GLOB_TESTS,
  extends:composeConfig({
      typescript: { tsconfigRootDir: import.meta.dirname },
      vitest: true,
      unicorn: false,
      stylistic: false,
      depend:false
    }),
})


export default [...appConfig,...vitestConfig];
