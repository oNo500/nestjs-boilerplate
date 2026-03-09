import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'

import { clearAuthState } from '@/testing/auth-fixtures'
import { server } from '@/testing/msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  server.resetHandlers()
  clearAuthState()
})
afterAll(() => server.close())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))
