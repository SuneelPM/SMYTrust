import { test, expect } from '@playwright/test';
import { ROUTES, settle, forceReveal } from './helpers';

/**
 * This is a registered charity subject to corporate due diligence. These tests
 * guard commitments that are easy to break by accident: no misleading links, no
 * fabricated social proof, and no bank identifiers leaking into a public build.
 */
test.describe('content integrity', () => {
  test('no link points at a bare social platform homepage', async ({ page }) => {
    const platforms = ['facebook.com', 'x.com', 'twitter.com', 'instagram.com', 'youtube.com'];

    for (const route of ROUTES) {
      await page.goto(route);
      const bare = await page.evaluate((hosts) => {
        return [...document.querySelectorAll('a[href^="http"]')]
          .map((a) => (a as HTMLAnchorElement).href)
          .filter((href) => {
            try {
              const url = new URL(href);
              const host = url.hostname.replace(/^www\./, '');
              return hosts.includes(host) && url.pathname.split('/').filter(Boolean).length === 0;
            } catch {
              return false;
            }
          });
      }, platforms);

      expect(bare, `${route} links to a platform homepage`).toEqual([]);
    }
  });

  test('unset social profiles render as inert placeholders, not links', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const pending = page.locator('.foot__social--pending');
    const count = await pending.count();
    test.skip(count === 0, 'real social URLs are configured');

    for (let i = 0; i < count; i++) {
      const el = pending.nth(i);
      expect(await el.evaluate((n) => n.tagName)).toBe('SPAN');
      await expect(el).toHaveAttribute('aria-label', /coming soon/i);
    }
    await expect(page.locator('footer')).toContainText(/coming soon/i);
  });

  test('no fabricated testimonials or placeholder filler is published', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const body = (await page.locator('body').innerText()).toLowerCase();
      expect(body, `${route} contains filler text`).not.toMatch(
        /lorem ipsum|sample name|do not ship|todo:/,
      );
    }
  });

  test('outstanding content gaps are visibly marked, not silently blank', async ({ page }) => {
    await page.goto('/activities/');
    await settle(page);
    await forceReveal(page);
    await expect(page.locator('.placeholder').first()).toBeVisible();
    await expect(page.locator('.placeholder__tag').first()).toContainText(/content needed/i);
  });

  test('registration numbers are published for due diligence', async ({ page }) => {
    await page.goto('/certificate/');
    await settle(page);
    await expect(page.locator('body')).toContainText('CSR00116527');
  });

  test('bank identifiers appear only when configured, never as an empty row', async ({ page }) => {
    await page.goto('/donate/');
    await settle(page);
    await forceReveal(page);

    const text = await page.locator('body').innerText();

    if (text.includes('Account number')) {
      const value = await page
        .locator('.bank__row', { hasText: 'Account number' })
        .locator('dd')
        .innerText();
      expect(value.trim().length, 'empty account row rendered').toBeGreaterThan(5);
    } else {
      expect(text).toMatch(/available on request/i);
      await expect(page.locator('[data-copy]')).toHaveCount(0);
    }
  });

  test('donate page always offers a way to give', async ({ page }) => {
    await page.goto('/donate/');
    await settle(page);
    await forceReveal(page);
    // Scope to main: the header's mobile menu also holds a mailto link.
    await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible();
  });
});
