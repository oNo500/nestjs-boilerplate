import { test as base } from '@playwright/test'

// Read env var directly to avoid cross-module import issues
const USE_API_MOCK = process.env.USE_API_MOCK === 'true'

interface ApiMock {
  login: (response: object, status?: number) => Promise<void>
  loginError: (detail?: string) => Promise<void>
  register: (response: object, status?: number) => Promise<void>
  registerError: (detail?: string) => Promise<void>
}

export const test = base.extend<{ apiMock: ApiMock }>({
  apiMock: async ({ page }, use) => {
    const mocks: ApiMock = {
      login: async (response, status = 200) => {
        if (!USE_API_MOCK) return
        await page.route('**/api/auth/login', (route) =>
          route.fulfill({ status, json: response }),
        )
      },
      loginError: async (detail = 'Invalid credentials') => {
        if (!USE_API_MOCK) return
        await page.route('**/api/auth/login', (route) =>
          route.fulfill({ status: 401, json: { detail } }),
        )
      },
      register: async (response, status = 200) => {
        if (!USE_API_MOCK) return
        await page.route('**/api/auth/register', (route) =>
          route.fulfill({ status, json: response }),
        )
      },
      registerError: async (detail = 'Email already registered') => {
        if (!USE_API_MOCK) return
        await page.route('**/api/auth/register', (route) =>
          route.fulfill({ status: 400, json: { detail } }),
        )
      },
    }
    await use(mocks)
  },
})

export { expect } from '@playwright/test'
