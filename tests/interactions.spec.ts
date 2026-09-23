import { test, expect } from '@playwright/test';
import { settle, forceReveal } from './helpers';

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile viewport only');

  test('opens, then closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const toggle = page.locator('[data-menu-open]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(page.locator('[data-menu]')).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-menu]')).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('navigates from the mobile menu', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    await page.locator('[data-menu-open]').click();
    await page.locator('[data-menu] a', { hasText: 'Contact' }).first().click();
    await expect(page).toHaveURL(/\/contact\/$/);
  });
});

test.describe('gallery lightbox', () => {
  test('opens an image, navigates, and closes on Escape', async ({ page }) => {
    await page.goto('/gallery/');
    await settle(page);
    const hasGalleryItems = (await page.locator('[data-lightbox]').count()) > 0;
    if (!hasGalleryItems) {
      await page.goto('/activities/');
      await settle(page);
    }

    const first = page.locator('[data-lightbox]').first();
    await first.scrollIntoViewIfNeeded();
    await first.click();

    const lb = page.locator('[data-lightbox-root]');
    await expect(lb).toBeVisible();
    await expect(lb.locator('[data-lb-count]')).toHaveText(/1 \/ \d+/);

    await page.keyboard.press('ArrowRight');
    await expect(lb.locator('[data-lb-count]')).toHaveText(/2 \/ \d+/);

    await page.keyboard.press('Escape');
    await expect(lb).toBeHidden();
  });

  test('gallery items are keyboard reachable', async ({ page }) => {
    await page.goto('/gallery/');
    await settle(page);
    const hasGalleryItems = (await page.locator('[data-lightbox]').count()) > 0;
    if (!hasGalleryItems) {
      await page.goto('/activities/');
      await settle(page);
    }
    const first = page.locator('[data-lightbox]').first();
    await expect(first).toHaveAttribute('tabindex', '0');
    await expect(first).toHaveAttribute('role', 'button');
  });
});

test.describe('contact form', () => {
  test('marks the fields it needs as required', async ({ page }) => {
    await page.goto('/contact/');
    await settle(page);

    for (const name of ['first_name', 'email', 'message']) {
      await expect(page.locator(`[name="${name}"]`)).toHaveAttribute('required', '');
    }
  });

  test('blocks submission when required fields are empty', async ({ page }) => {
    await page.goto('/contact/');
    await settle(page);
    await forceReveal(page);

    await page.locator('form[data-contact-form] button[type="submit"]').click();
    const invalid = await page.evaluate(
      () => document.querySelectorAll('form[data-contact-form] :invalid').length,
    );
    expect(invalid, 'empty form submitted without validation').toBeGreaterThan(0);
  });

  test('carries a honeypot that stays hidden from people', async ({ page }) => {
    await page.goto('/contact/');
    await settle(page);
    const honeypot = page.locator('[name="botcheck"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toBeHidden();
  });

  test('falls back to email when no form key is configured', async ({ page }) => {
    await page.goto('/contact/');
    await settle(page);

    const form = page.locator('form[data-contact-form]');
    const action = await form.getAttribute('action');
    const method = await form.getAttribute('method');

    if (action?.startsWith('mailto:')) {
      expect(method?.toLowerCase()).toBe('get');
      await expect(page.locator('.placeholder')).toContainText(/setup needed/i);
    } else {
      expect(action).toContain('web3forms.com');
    }
  });

  test('map and direct contact details are present', async ({ page }) => {
    await page.goto('/contact/');
    await settle(page);
    await forceReveal(page);
    await expect(page.locator('iframe.map')).toHaveCount(1);
    // Scope to main: the header's mobile menu also holds a tel link.
    await expect(page.locator('main a[href^="tel:"]').first()).toBeVisible();
  });
});

test.describe('header and rail', () => {
  test('header becomes solid after scrolling', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const header = page.locator('[data-header]');
    await expect(header).not.toHaveClass(/is-stuck/);

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(600);
    await expect(header).toHaveClass(/is-stuck/);
  });

  test('contact rail shows on desktop and hides on mobile', async ({ page, isMobile }) => {
    await page.goto('/');
    await settle(page);

    const rail = page.locator('.rail');
    if (isMobile) {
      await expect(rail).toBeHidden();
    } else {
      await expect(rail).toBeVisible();
      await expect(rail.locator('a')).toHaveCount(3);
    }
  });

  test('rail links expand to reveal their detail on hover', async ({ page, isMobile }) => {
    test.skip(isMobile, 'rail is hidden on mobile');
    await page.goto('/');
    await settle(page);

    const item = page.locator('.rail__item').first();
    const collapsed = (await item.boundingBox())!.width;
    await item.hover();
    await page.waitForTimeout(700);
    const expanded = (await item.boundingBox())!.width;

    expect(expanded, 'rail did not expand on hover').toBeGreaterThan(collapsed);
  });
});
