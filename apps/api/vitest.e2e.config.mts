import swc from 'unplugin-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './',
    include: ['src/__tests__/**/*.e2e-spec.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],
    testTimeout: 30_000,
  },
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
          dynamicImport: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        target: 'esnext',
        keepClassNames: true,
      },
      module: {
        type: 'es6',
      },
    }),
    tsconfigPaths(),
  ],
})
