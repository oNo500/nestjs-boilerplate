import { expect, test } from '../fixtures'

test.describe('Register Flow', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your username')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByPlaceholder('Confirm your password')).toBeVisible()
  })

  test('should validate password match', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder('Enter your email').fill('new@example.com')
    await page.getByPlaceholder('Enter your username').fill('newuser')
    await page.getByPlaceholder('Enter your password').fill('Password123')
    await page.getByPlaceholder('Confirm your password').fill('Different123')
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/match/i)).toBeVisible({ timeout: 5000 })
  })

  test('should validate password contains letters and numbers', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder('Enter your email').fill('new@example.com')
    await page.getByPlaceholder('Enter your username').fill('newuser')
    await page.getByPlaceholder('Enter your password').fill('12345678') // only numbers
    await page.getByPlaceholder('Confirm your password').fill('12345678')
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/letter/i)).toBeVisible({ timeout: 5000 })
  })

  test('should register successfully with valid data', async ({ page, apiMock }) => {
    await apiMock.register({ user: { email: 'new@example.com' } })
    await page.goto('/register')

    const uniqueEmail = `user_${Date.now()}@example.com`

    await page.getByPlaceholder('Enter your email').fill(uniqueEmail)
    await page.getByPlaceholder('Enter your username').fill('newuser')
    await page.getByPlaceholder('Enter your password').fill('Password123')
    await page.getByPlaceholder('Confirm your password').fill('Password123')
    await page.getByRole('button', { name: /create account/i }).click()

    // Redirect to login page after success
    await page.waitForURL('/login', { timeout: 10_000 })
  })

  test('should show error for existing email', async ({ page, apiMock }) => {
    await apiMock.registerError('Email already registered')
    await page.goto('/register')

    await page.getByPlaceholder('Enter your email').fill('test@example.com') // Existing email
    await page.getByPlaceholder('Enter your username').fill('newuser')
    await page.getByPlaceholder('Enter your password').fill('Password123')
    await page.getByPlaceholder('Confirm your password').fill('Password123')
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/exists/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test('should have link to login page', async ({ page }) => {
    await page.goto('/register')
    const loginLink = page.getByRole('link', { name: /login/i })
    await expect(loginLink).toBeVisible()
    await loginLink.click()
    await page.waitForURL('/login')
  })
})
