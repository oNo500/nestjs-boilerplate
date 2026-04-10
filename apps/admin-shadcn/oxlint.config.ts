import { base, depend, nextjs, react, unicorn, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base(),
    unicorn(),
    depend(),
    react(),
    nextjs(),
    vitest({ files: ['**/*.{test,spec}.ts', '**/*.{test,spec}.tsx', '**/__tests__/**/*.ts'] }),
  ],
})
