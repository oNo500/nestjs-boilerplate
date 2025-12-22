/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
    },
    testTimeout: 10_000,
  },
})
