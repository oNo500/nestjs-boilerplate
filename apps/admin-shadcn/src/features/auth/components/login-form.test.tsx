import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it, expect, vi } from 'vitest'

import { mockCredentials } from '@/testing/auth-fixtures'
import { renderWithProviders } from '@/testing/render'

import { LoginForm } from './login-form'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

describe('loginForm', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('calls router.push after successful login', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), mockCredentials.valid.email)
    await user.type(screen.getByLabelText(/password/i), mockCredentials.valid.password)
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/dashboards/analytics'))
    }, { timeout: 5000 })
  })

  it('login button is present and enabled initially', () => {
    renderWithProviders(<LoginForm />)
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })
})
