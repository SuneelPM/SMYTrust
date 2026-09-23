import type { Page } from '@playwright/test';

/** Every route the site publishes. Keep in sync with src/pages. */
export const ROUTES = [
  '/',
  '/about/',
  '/services/',
  '/activities/',
  '/gallery/',
  '/certificate/',
  '/csr-fund/',
  '/contact/',
  '/donate/',
  '/privacy-policy/',
  '/terms-conditions/',
  '/refund-policy/',
] as const;

/** Routes reachable from the primary navigation. */
export const NAV_ROUTES = [
  '/',
  '/about/',
  '/services/',
  '/activities/',
  '/gallery/',
  '/certificate/',
  '/csr-fund/',
  '/contact/',
] as const;

/**
 * The preloader covers the page on a first visit and is removed by script.
 * Wait it out so tests never race it, and settle any entrance animation.
 */
export async function settle(page: Page) {
  await page.waitForFunction(() => !document.querySelector('[data-preloader]'), null, {
    timeout: 8000,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
}

/** Walk the full page height so every ScrollTrigger fires, then return to top. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 700));
  });
}

/** Elements that are still invisible because a reveal never ran. */
export function hiddenRevealCount(page: Page) {
  return page.evaluate(
    () =>
      [...document.querySelectorAll('[data-reveal], [data-reveal-group] > *')].filter(
        (el) => getComputedStyle(el).visibility === 'hidden',
      ).length,
  );
}

/** True when the document scrolls sideways at the current viewport. */
export function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

/**
 * Force every reveal target visible.
 *
 * Content below the fold starts at visibility:hidden and is unhidden by
 * ScrollTrigger. Tests that assert on that content should not race the
 * animation, so they make it visible deterministically first.
 */
export async function forceReveal(page: Page) {
  await page.evaluate(() => {
    document
      .querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-group] > *')
      .forEach((el) => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
  });
  await page.waitForTimeout(150);
}
