import { test, expect } from '@playwright/test';
import { ROUTES, settle, scrollThrough, hiddenRevealCount, hasHorizontalOverflow } from './helpers';

test.describe('layout and reveals', () => {
  for (const route of ROUTES) {
    test(`${route} never scrolls sideways`, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      expect(await hasHorizontalOverflow(page), `${route} overflows horizontally`).toBe(false);

      await scrollThrough(page);
      expect(await hasHorizontalOverflow(page), `${route} overflows after scrolling`).toBe(false);
    });
  }

  for (const route of ROUTES) {
    test(`${route} reveals all deferred content on scroll`, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      await scrollThrough(page);

      const hidden = await hiddenRevealCount(page);
      expect(hidden, `${route} left ${hidden} element(s) permanently invisible`).toBe(0);
    });
  }

  test('narrow viewports do not overflow', async ({ page }) => {
    for (const width of [320, 360, 414, 768]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/services/');
      await settle(page);
      expect(await hasHorizontalOverflow(page), `overflow at ${width}px`).toBe(false);
    }
  });

  test('content stays visible when JavaScript never runs', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/about/');

    // The .no-js rule must unhide reveal targets, and the preloader must not trap the page.
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toContainText(/Kindness|helping hand/i);
    await ctx.close();
  });

  test('reduced motion still shows all content and stops autoplay', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.waitForTimeout(1500);

    expect(await hiddenRevealCount(page), 'content hidden under reduced motion').toBe(0);

    const first = await page.locator('[data-dot]').first().getAttribute('aria-selected');
    await page.waitForTimeout(9000);
    expect(
      await page.locator('[data-dot]').first().getAttribute('aria-selected'),
      'carousel autoplayed under reduced motion',
    ).toBe(first);
    await ctx.close();
  });

  test('preloader always clears itself', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-preloader]')).toHaveCount(0, { timeout: 8000 });
    const locked = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(locked, 'scroll left locked by the preloader').not.toBe('hidden');
  });
});
