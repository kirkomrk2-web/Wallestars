import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES_TO_AUDIT = [
  { path: '/', name: 'Dashboard' },
  { path: '/logs', name: 'System Logs' },
  { path: '/settings', name: 'Settings' },
  { path: '/chat', name: 'Chat' },
];

test.describe('Accessibility (axe-core)', () => {
  for (const { path, name } of ROUTES_TO_AUDIT) {
    test(`${name} (${path}) — zero critical violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .exclude(['[data-testid="skip-axe"]']) // opt-out for known third-party widgets
        .analyze();

      // Critical violations must be 0
      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      if (critical.length > 0) {
        const report = critical
          .map(
            (v) =>
              `\n  [${v.impact}] ${v.id}: ${v.description}\n    Nodes: ${v.nodes
                .slice(0, 2)
                .map((n) => n.html)
                .join(', ')}`
          )
          .join('');
        expect.soft(critical, `Critical a11y violations on ${path}:${report}`).toHaveLength(0);
      }

      // Log all violations for review (non-failing)
      if (results.violations.length > 0) {
        console.log(
          `[axe] ${path} — ${results.violations.length} violations (${critical.length} critical)`
        );
      }

      // Hard fail only on critical/serious
      expect(critical).toHaveLength(0);
    });
  }

  test('no violations on keyboard navigation focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['focus-trap', 'scrollable-region-focusable'])
      .analyze();

    const focusViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(focusViolations).toHaveLength(0);
  });
});
