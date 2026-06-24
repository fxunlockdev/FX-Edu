import { test } from '@playwright/test';

// Design-taste capture (not assertions): full-page Home at key breakpoints
// per the web testing rules (mobile 390, desktop 1440).
const VIEWS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

for (const view of VIEWS) {
  test(`home ${view.name} screenshot`, async ({ page }) => {
    await page.setViewportSize({ width: view.width, height: view.height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `e2e/__screens__/home-${view.name}.png`,
      fullPage: true,
    });
  });
}
