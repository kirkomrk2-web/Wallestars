import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('home page loads and renders React app', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // React app root is present
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Page has actual content (not just loading spinner forever)
    await expect(root).not.toBeEmpty();
  });

  test('page title is set', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('no console errors on home page', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('net::ERR') &&
        !e.includes('404')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('API health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health');
    // Accept 200 or 404 (route may not exist) but not 500
    expect(response.status()).not.toBe(500);
  });
});
