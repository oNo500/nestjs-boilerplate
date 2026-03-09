import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const sharedConfig = {
  plugins: [tsconfigPaths(), react()],
}

const sharedTestConfig = {
  globals: true,
  setupFiles: ['./__tests__/setup.ts'],
  environment: 'jsdom' as const,
}

export default defineConfig({
  ...sharedConfig,
  test: {
    projects: [
      {
        ...sharedConfig,
        test: {
          ...sharedTestConfig,
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        ...sharedConfig,
        test: {
          ...sharedTestConfig,
          name: 'e2e',
          include: ['__tests__/e2e/**/*.test.{ts,tsx}'],
          testTimeout: 15000,
        },
      },
    ],
  },
})
