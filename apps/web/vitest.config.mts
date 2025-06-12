import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
export default defineConfig({
  plugins: [tsconfigPaths(), react()],

  test: {
    globals: true,
    include: ['./src/**/*.test.tsx'],
    setupFiles: './src/testing/vitest-setup.ts',
    browser: {
      provider: 'playwright',
      enabled: true,
      // at least one instance is required
      instances: [{ browser: 'chromium' }],
    },
  },
});
