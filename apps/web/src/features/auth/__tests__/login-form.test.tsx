import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@/testing'
import userEvent from '@testing-library/user-event'

import { LoginForm } from '../components/login-form'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginForm />)

    expect(screen.getByText('Login to your account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/enter your password/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should have default values', () => {
    render(<LoginForm />)

    expect(screen.getByPlaceholderText(/enter your email/i)).toHaveValue(
      'user@example.com',
    )
    expect(screen.getByPlaceholderText(/enter your password/i)).toHaveValue(
      'Pass123456',
    )
  })

  it('should show validation errors for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'invalid')

    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('should show validation errors for short password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    await user.clear(passwordInput)
    await user.type(passwordInput, 'short')

    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  // API submission flow covered in E2E tests

  it('should have link to register page', () => {
    render(<LoginForm />)

    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/register',
    )
  })

  it('should match snapshot', () => {
    const { container } = render(<LoginForm />)
    expect(container).toMatchSnapshot()
  })
})
