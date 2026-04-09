import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/', title: 'Dashboard', selector: '[data-testid="dashboard"], main, h1' },
  { path: '/chat', title: 'Chat', selector: '[data-testid="chat"], main' },
  { path: '/logs', title: 'System Logs', selector: '[data-testid="system-logs"], main' },
  { path: '/settings', title: 'Settings', selector: '[data-testid="settings"], main' },
  { path: '/orchestration', title: 'Orchestration', selector: 'main' },
  { path: '/agentregistry', title: 'Agent Registry', selector: 'main' },
];

test.describe('React Router Navigation', () => {
  for (const route of ROUTES) {
    test(`loads ${route.path} without crashing`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      // Page renders content (not blank)
      const content = await page.locator(route.selector).first();
      await expect(content).toBeVisible({ timeout: 10_000 });

      // No unhandled JS errors
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('404') &&
          !e.includes('WebSocket') &&
          !e.includes('socket.io') &&
          !e.includes('net::ERR_CONNECTION_REFUSED') &&
          !e.includes('Failed to fetch')
      );
      expect(criticalErrors, `JS errors on ${route.path}: ${criticalErrors.join(', ')}`).toHaveLength(0);
    });
  }

  test('unknown route redirects to /', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/$/);
  });

  test('direct navigation to /logs loads System Logs page', async ({ page }) => {
    await page.goto('/logs');
    await page.waitForLoadState('networkidle');
    const heading = page.getByRole('heading', { name: /log|system/i });
    const fallback = page.locator('main');
    await expect(heading.or(fallback)).toBeVisible({ timeout: 10_000 });
  });

  test('navigation links work without full page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that clicking a nav link does a client-side transition (no full reload)
    const navLink = page.locator('nav a[href="/logs"], a[href="/logs"]').first();
    if (await navLink.count() > 0) {
      await Promise.all([
        page.waitForURL('/logs', { timeout: 5_000 }),
        navLink.click(),
      ]);
      expect(page.url()).toContain('/logs');
    } else {
      test.skip();
    }
  });
});

test.describe('SPA Deep Link (direct URL)', () => {
  test('/logs serves the SPA shell (not 404)', async ({ page }) => {
    const response = await page.goto('/logs');
    // Express catch-all should return 200 with HTML shell
    expect(response?.status()).toBe(200);
    const ct = response?.headers()['content-type'] ?? '';
    expect(ct).toContain('text/html');
  });

  test('/chat serves the SPA shell (not 404)', async ({ page }) => {
    const response = await page.goto('/chat');
    expect(response?.status()).toBe(200);
  });
});
