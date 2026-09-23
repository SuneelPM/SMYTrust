import { test, expect } from '@playwright/test';
import { ROUTES, settle } from './helpers';

/**
 * Every page must open with the same full-viewport hero treatment. A previous
 * regression left inner-page heroes at 1359-2997px because the background image
 * escaped its absolutely-positioned box, so height is asserted explicitly.
 */
test.describe('hero parity', () => {
  for (const route of ROUTES) {
    test(`${route} hero fills the viewport with a visible image`, async ({ page }) => {
      await page.goto(route);
      await settle(page);

      const hero = page.locator('.hero, .phero').first();
      await expect(hero).toBeVisible();

      const { heroHeight, viewport, opacity, imgW, imgH } = await hero.evaluate((el) => {
        const img = el.querySelector('img')!;
        const r = img.getBoundingClientRect();
        return {
          heroHeight: Math.round(el.getBoundingClientRect().height),
          viewport: window.innerHeight,
          opacity: getComputedStyle(img).opacity,
          imgW: Math.round(r.width),
          imgH: Math.round(r.height),
        };
      });

      // Full viewport height, within a pixel of rounding.
      expect(Math.abs(heroHeight - viewport), `${route} hero height`).toBeLessThanOrEqual(2);
      // Image at full strength - the scrim provides contrast, not opacity.
      expect(opacity, `${route} hero image opacity`).toBe('1');
      // Image actually painted, not collapsed.
      expect(imgW).toBeGreaterThan(200);
      expect(imgH).toBeGreaterThan(200);
    });
  }

  test('hero heading and lead are visible without scrolling', async ({ page }) => {
    await page.goto('/services/');
    await settle(page);
    await expect(page.locator('h1')).toBeInViewport();
    await expect(page.locator('.phero__lead')).toBeVisible();
  });

  test('header sits over the hero and does not cover the heading', async ({ page }) => {
    await page.goto('/about/');
    await settle(page);

    const overlap = await page.evaluate(() => {
      const h = document.querySelector('[data-header]')!.getBoundingClientRect();
      const t = document.querySelector('h1')!.getBoundingClientRect();
      return t.top < h.bottom && t.bottom > h.top;
    });
    expect(overlap, 'header overlaps the h1').toBe(false);
  });
});
