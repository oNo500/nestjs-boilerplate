import { expect, test } from '@playwright/test'

test.describe('Layout', () => {
  test('should render header on all pages', async ({ page }) => {
    // Home page
    await page.goto('/')
    await expect(page.getByRole('banner')).toBeVisible()

    // Login page
    await page.goto('/login')
    await expect(page.getByRole('banner')).toBeVisible()

    // Register page
    await page.goto('/register')
    await expect(page.getByRole('banner')).toBeVisible()
  })

  test('should render logo in header', async ({ page }) => {
    await page.goto('/')

    // Logo should be in header
    const header = page.getByRole('banner')
    const logo = header.locator('a').first()
    await expect(logo).toBeVisible()
  })

  test('should render theme toggle in header', async ({ page }) => {
    await page.goto('/')

    const header = page.getByRole('banner')
    const themeToggle = header.getByRole('button', { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Header should still be visible
    await expect(page.getByRole('banner')).toBeVisible()

    // Theme toggle should still be usable
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()
  })

  test('should show correct layout on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.getByRole('banner')).toBeVisible()
  })
})
