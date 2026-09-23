import { test, expect } from '@playwright/test';
import { ROUTES, NAV_ROUTES, settle } from './helpers';

test.describe('routing', () => {
  for (const route of ROUTES) {
    test(`${route} responds 200 and renders a heading`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status(), `HTTP status for ${route}`).toBe(200);
      await settle(page);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();
      await expect(page.locator('h1')).toBeVisible();
    });
  }

  test('unknown URL serves the 404 page, not a server error', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('body')).toContainText(/moved on|not|404/i);
  });

  test('every primary nav link resolves to a real page', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const hrefs = await page
      .locator('header nav[aria-label="Primary"] a')
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')));

    expect(hrefs.length).toBeGreaterThanOrEqual(NAV_ROUTES.length);

    for (const href of hrefs) {
      const res = await page.request.get(href!);
      expect(res.status(), `nav link ${href}`).toBe(200);
    }
  });

  test('footer legal links resolve', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    const hrefs = await page
      .locator('footer a[href^="/"]')
      .evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute('href')))]);

    for (const href of hrefs) {
      const res = await page.request.get(href!);
      expect(res.status(), `footer link ${href}`).toBe(200);
    }
  });

  test('clicking through the nav actually navigates', async ({ page, isMobile }) => {
    await page.goto('/');
    await settle(page);
    if (isMobile) test.skip(true, 'covered by the mobile-menu spec');

    await page.locator('header nav[aria-label="Primary"] a', { hasText: 'About Us' }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.locator('h1')).toContainText(/helping hand/i);
  });
});
