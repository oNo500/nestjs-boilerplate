import { expect, test } from '@playwright/test'

test.describe('Home Page', () => {
  test('should render hero heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Boilerplate' })).toBeVisible()
  })
})
