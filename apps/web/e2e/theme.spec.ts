import { expect, test } from '@playwright/test'

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle theme from light to dark', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()

    // Click to switch to dark mode
    await themeToggle.click()

    // Should be in dark mode
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 2000 })
  })

  test('should toggle theme from dark to light', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })

    // First switch to dark mode
    await themeToggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // Then switch back to light mode
    await themeToggle.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/, {
      timeout: 2000,
    })
  })

  test('should persist theme preference after reload', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })

    // Switch to dark mode
    await themeToggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // Reload page
    await page.reload()

    // Should remain in dark mode
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 3000 })
  })
})
