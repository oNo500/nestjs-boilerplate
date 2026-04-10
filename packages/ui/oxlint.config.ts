import { base, depend, react, unicorn } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base({
      rules: {
        // shadcn-generated components use variable shadowing patterns
        'no-shadow': 'off',
      },
    }),
    unicorn(),
    depend(),
    react({
      rules: {
        // React components use the automatic JSX runtime
        'react/react-in-jsx-scope': 'off',
      },
    }),
  ],
})
