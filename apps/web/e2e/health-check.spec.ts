import test, { expect } from '@playwright/test';

const pagesToTest = [
  { path: '/', title: /React Boilerplate/i },
  { path: '/login', title: /React Boilerplate/i },
  { path: '/register', title: /React Boilerplate/i },
];

test.describe('📊 Page Health Check', () => {
  for (const pageInfo of pagesToTest) {
    test(`✅ Page ${pageInfo.path} is accessible`, async ({ page }) => {
      const start = Date.now();

      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });

      // Check if the title matches
      await expect(page).toHaveTitle(pageInfo.title);

      // Simple performance check
      const loadTime = await page.evaluate(() => {
        const [nav] = performance.getEntriesByType('navigation');
        return nav && 'loadEventEnd' in nav ? (nav as PerformanceNavigationTiming).loadEventEnd : 0;
      });
      console.log(`Page ${pageInfo.path} load time: ${loadTime}ms`);

      // Load time assertion
      expect(loadTime).toBeLessThan(3000);
    });
  }
});
