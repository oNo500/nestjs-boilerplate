import { composeConfig } from '@workspace/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  imports: true,
})
