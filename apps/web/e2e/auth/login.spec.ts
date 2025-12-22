import { expect, test } from '../fixtures'

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Login to your account')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Enter your email').fill('invalid-email')
    await page.getByPlaceholder('Enter your password').fill('short')
    await page.getByRole('button', { name: /login/i }).click()

    // Wait for validation errors
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 5000 })
  })

  test('should login successfully with valid credentials', async ({ page, apiMock }) => {
    await apiMock.login({ user: { email: 'test@example.com' } })
    await page.goto('/login')

    await page.getByPlaceholder('Enter your email').fill('test@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    await page.getByRole('button', { name: /login/i }).click()

    // Wait for redirect to home
    await page.waitForURL('/', { timeout: 10_000 })
  })

  test('should show error message for invalid credentials', async ({ page, apiMock }) => {
    await apiMock.loginError('Invalid credentials')
    await page.goto('/login')

    await page.getByPlaceholder('Enter your email').fill('wrong@example.com')
    await page.getByPlaceholder('Enter your password').fill('wrongpassword')
    await page.getByRole('button', { name: /login/i }).click()

    // Wait for error message
    await expect(page.getByText(/failed|invalid/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test('should have link to register page', async ({ page }) => {
    await page.goto('/login')
    const signUpLink = page.getByRole('link', { name: /sign up/i })
    await expect(signUpLink).toBeVisible()
    await signUpLink.click()
    await page.waitForURL('/register')
  })

  test('should show loading state during submission', async ({ page }) => {
    // Delay response to observe loading state
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({ status: 200, json: { user: { email: 'test@example.com' } } })
    })
    await page.goto('/login')

    await page.getByPlaceholder('Enter your email').fill('test@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')

    const submitButton = page.getByRole('button', { name: /login/i })
    await submitButton.click()

    // Button should be disabled
    await expect(submitButton).toBeDisabled({ timeout: 1000 })
  })
})
