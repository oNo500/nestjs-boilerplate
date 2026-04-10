import { format, tailwindFormat } from '@infra-x/code-quality/format'
import { defineConfig } from 'oxfmt'

export default defineConfig({
  ...format(),
  ...tailwindFormat({ stylesheet: 'src/styles/globals.css' }),
})
