import { test, expect } from '@playwright/test';

// Smoke + screenshot every marketing route: one visible h1, a footer, and no
// uncaught page errors. Doubles as the design-taste capture (full-page desktop).
const ROUTES = [
  '/',
  '/pricing',
  '/curriculum',
  '/webinars',
  '/tools',
  '/ai-learning',
  '/affiliates',
  '/partners',
];

for (const route of ROUTES) {
  test(`renders ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    const slug = route === '/' ? 'home' : route.replace(/\//g, '');
    await page.screenshot({
      path: `e2e/__screens__/page-${slug}.png`,
      fullPage: true,
    });

    expect(errors, `page errors on ${route}`).toEqual([]);
  });
}
