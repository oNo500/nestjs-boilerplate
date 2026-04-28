import { base, depend, react, unicorn } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  // Sources here are vendored from shadcn cli; not subject to project lint rules.
  ignorePatterns: ['src/**'],
  extends: [base(), unicorn(), depend(), react()],
})
