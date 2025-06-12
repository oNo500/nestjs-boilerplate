import { test, expect } from '@playwright/test';

test('Home page should open normally', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/React Boilerplate/i);
});

test('Login page should be accessible and login button should be clickable', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});
