import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with a single visible h1', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Master forex');
  });

  test('renders the risk disclaimer text', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByText('Nothing on this platform is financial advice', { exact: false }).first(),
    ).toBeVisible();
  });

  test('main navigation exposes the 8 marketing links', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.locator('a.pubnav-link')).toHaveCount(8);
    for (const label of [
      'Home',
      'Curriculum',
      'Pricing',
      'Webinars',
      'Tools',
      'AI Learning',
      'Affiliates',
      'Partners',
    ]) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
  });

  test('shows a referral banner for a valid ?ref', async ({ page }) => {
    await page.goto('/?ref=jordan');
    await expect(page.getByText('You were referred by', { exact: false })).toBeVisible();
  });
});
