import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES, settle, forceReveal } from './helpers';

test.describe('accessibility', () => {
  for (const route of ROUTES) {
    test(`${route} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route);
      await settle(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // Reveal targets start hidden by design and are unhidden on scroll;
        // axe cannot judge contrast on an element it cannot see.
        .disableRules(['color-contrast'])
        .analyze();

      const summary = results.violations.map(
        (v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`,
      );
      expect(summary, `axe violations on ${route}`).toEqual([]);
    });
  }

  test('colour contrast passes on fully revealed content', async ({ page }) => {
    for (const route of ['/', '/about/', '/donate/', '/contact/']) {
      await page.goto(route);
      await settle(page);
      await forceReveal(page);

      const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
      const contrast = results.violations.filter((v) => v.id === 'color-contrast');
      expect(
        contrast.flatMap((v) => v.nodes.map((n) => n.html.slice(0, 90))),
        `contrast failures on ${route}`,
      ).toEqual([]);
    }
  });

  test('skip link is the first focusable element and reveals on focus', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    await page.keyboard.press('Tab');

    const skip = page.locator('a.skip');
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box!.width, 'focused skip link is still visually hidden').toBeGreaterThan(20);
  });

  test('skip link moves focus to the main landmark', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    // Smooth scrolling intercepts the hash navigation, so assert the outcome
    // that matters: focus must land on the main landmark, otherwise the next
    // Tab would continue through the header and the skip link is useless.
    await page.waitForTimeout(900);
    const focusedIsMain = await page.evaluate(() => {
      const main = document.getElementById('main');
      return document.activeElement === main || main?.contains(document.activeElement);
    });
    expect(focusedIsMain, 'focus did not move into <main>').toBe(true);
  });

  test('every image has an alt attribute', async ({ page }) => {
    await page.goto('/gallery/');
    await settle(page);
    const missing = await page.locator('img:not([alt])').count();
    expect(missing, 'images without an alt attribute').toBe(0);
  });

  test('icon-only controls expose an accessible name', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('button, a')].filter((el) => {
        const text = (el.textContent || '').trim();
        const label = el.getAttribute('aria-label') || el.getAttribute('title');
        return !text && !label;
      }).length,
    );
    expect(unnamed, 'controls with no accessible name').toBe(0);
  });

  test('page has exactly one h1 and a main landmark', async ({ page }) => {
    for (const route of ['/', '/donate/', '/contact/']) {
      await page.goto(route);
      await expect(page.locator('h1'), route).toHaveCount(1);
      await expect(page.locator('main'), route).toHaveCount(1);
    }
  });
});
