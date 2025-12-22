import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@/testing'
import userEvent from '@testing-library/user-event'

import { RegisterForm } from '../components/register-form'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render registration form', () => {
    render(<RegisterForm />)

    expect(screen.getByText('Register')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/enter your username/i),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/enter your password/i),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/confirm your password/i),
    ).toBeInTheDocument()
  })

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const confirmInput = screen.getByPlaceholderText(/confirm your password/i)

    await user.clear(passwordInput)
    await user.type(passwordInput, 'Password123')
    await user.clear(confirmInput)
    await user.type(confirmInput, 'Different123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(confirmInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('should validate password contains letters and numbers', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const confirmInput = screen.getByPlaceholderText(/confirm your password/i)

    await user.clear(passwordInput)
    await user.type(passwordInput, '12345678') // only numbers
    await user.clear(confirmInput)
    await user.type(confirmInput, '12345678')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  // API submission flow covered in E2E tests

  it('should have link to login page', () => {
    render(<RegisterForm />)

    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('should match snapshot', () => {
    const { container } = render(<RegisterForm />)
    expect(container).toMatchSnapshot()
  })
})
