import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')

    // Check home page content
    await expect(page.getByRole('banner')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // If login link exists
    const loginLink = page.getByRole('link', { name: /login/i })
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await page.waitForURL('/login')
      await expect(page.getByText('Login to your account')).toBeVisible()
    }
  })

  test('should navigate to register page from login', async ({ page }) => {
    await page.goto('/login')

    const signUpLink = page.getByRole('link', { name: /sign up/i })
    await signUpLink.click()
    await page.waitForURL('/register')
    await expect(page.getByText('Create your account')).toBeVisible()
  })

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-that-does-not-exist')

    await expect(page.getByText(/not found|404/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test('should navigate back to home via logo', async ({ page }) => {
    await page.goto('/login')

    // Click logo to return home
    const logoLink = page.locator('header a').first()
    await logoLink.click()
    await page.waitForURL('/')
  })
})
