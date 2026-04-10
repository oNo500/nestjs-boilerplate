import { base, depend, react, unicorn } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base(),
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
