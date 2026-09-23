import { test, expect } from '@playwright/test';
import { settle } from './helpers';

test.describe('homepage hero carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await settle(page);
  });

  test('renders one slide per dot and starts on the first', async ({ page }) => {
    const dots = page.locator('[data-dot]');
    const slides = page.locator('[data-slide-text]');
    await expect(dots).toHaveCount(await slides.count());
    await expect(dots.first()).toHaveAttribute('aria-selected', 'true');
    await expect(slides.first()).toHaveAttribute('aria-hidden', 'false');
  });

  test('next advances and previous returns', async ({ page }) => {
    const dots = page.locator('[data-dot]');
    await page.locator('[data-next]').click();
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.locator('[data-prev]').click();
    await expect(dots.first()).toHaveAttribute('aria-selected', 'true');
  });

  test('a dot jumps straight to its slide', async ({ page }) => {
    const dots = page.locator('[data-dot]');
    await dots.nth(2).click();
    await expect(dots.nth(2)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-slide-text]').nth(2)).toHaveAttribute('aria-hidden', 'false');
  });

  test('pause stops autoplay and play resumes it', async ({ page }) => {
    const pause = page.locator('[data-pause]');
    const dots = page.locator('[data-dot]');

    await pause.click();
    await expect(pause).toHaveAttribute('aria-label', /play/i);

    const before = await dots.nth(0).getAttribute('aria-selected');
    await page.waitForTimeout(9000);
    expect(await dots.nth(0).getAttribute('aria-selected'), 'paused carousel advanced').toBe(before);

    await pause.click();
    await expect(pause).toHaveAttribute('aria-label', /pause/i);
  });

  test('autoplay advances on its own', async ({ page }) => {
    await expect(page.locator('[data-dot]').first()).toHaveAttribute('aria-selected', 'true');
    // DURATION is 7s in HeroCarousel.astro.
    await expect(page.locator('[data-dot]').nth(1)).toHaveAttribute('aria-selected', 'true', {
      timeout: 12_000,
    });
  });

  test('arrow keys move between slides', async ({ page }) => {
    await page.locator('[data-carousel]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-dot]').nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-dot]').first()).toHaveAttribute('aria-selected', 'true');
  });

  test('slide changes are announced to screen readers', async ({ page }) => {
    const live = page.locator('[data-live]');
    await expect(live).toHaveAttribute('aria-live', 'polite');
    await page.locator('[data-next]').click();
    await expect(live).toHaveText(/slide 2 of \d+/i);
  });

  test('only the visible slide is in the tab order', async ({ page }) => {
    const offscreenFocusable = await page.evaluate(() => {
      const panels = [...document.querySelectorAll('[data-slide-text]')];
      return panels
        .filter((p) => p.getAttribute('aria-hidden') === 'true')
        .flatMap((p) => [...p.querySelectorAll('a')])
        .filter((a) => (a as HTMLAnchorElement).tabIndex !== -1).length;
    });
    expect(offscreenFocusable, 'hidden slides expose focusable links').toBe(0);
  });

  test('each slide has its own call to action', async ({ page }) => {
    const ctas = await page
      .locator('[data-slide-text] a.btn-primary')
      .evaluateAll((els) => els.map((e) => e.textContent?.trim()));
    expect(new Set(ctas).size, 'slide CTAs are not distinct').toBeGreaterThan(1);
  });
});
