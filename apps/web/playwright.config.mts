import { config } from 'dotenv'
import { defineConfig, devices } from '@playwright/test'
import { z } from 'zod'

// Load .env.e2e environment variables
config({ path: '.env.e2e' })

const e2eEnvSchema = z.object({
  BASE_URL: z.string().url().default('http://localhost:3000'),
  USE_API_MOCK: z.string().default('false').transform((v) => v === 'true'),
})
const e2eEnv = e2eEnvSchema.parse(process.env)

const PORT = 3000

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in parallel */
  fullyParallel: true,
  /* Fail CI build if test.only accidentally left in source */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Disable parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all projects. See https://playwright.dev/docs/api/class-testoptions */
  use: {
    /* Base URL for `await page.goto('/')` */
    baseURL: e2eEnv.BASE_URL,

    /* Collect trace on first retry. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run local dev server before starting tests */
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    timeout: 60 * 1000,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
})
