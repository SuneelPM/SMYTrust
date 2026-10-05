import { test, expect } from '@playwright/test';
import { ROUTES } from './helpers';

test.describe('SEO and metadata', () => {
  for (const route of ROUTES) {
    test(`${route} carries complete metadata`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveTitle(/.{10,}/);

      const desc = page.locator('meta[name="description"]');
      await expect(desc).toHaveAttribute('content', /.{50,}/);

      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    });
  }

  test('titles are unique across pages', async ({ page }) => {
    const titles: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route);
      titles.push(await page.title());
    }
    expect(new Set(titles).size, 'duplicate <title> found').toBe(titles.length);
  });

  test('homepage publishes valid NGO structured data', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw!);
    expect(data['@type']).toBe('NGO');
    expect(data.name).toContain('Sri Matha Yellamanba');
    expect(data.address.addressLocality).toBe('Vijayawada');
    expect(data.telephone).toBeTruthy();
  });

  test('robots.txt and sitemap are served', async ({ page }) => {
    const robots = await page.request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    const body = await robots.text();
    expect(body).toMatch(/user-agent:\s*\*/i);

    const sitemap = await page.request.get('/sitemap-index.xml');
    expect(sitemap.status()).toBe(200);
  });

  test('favicon.ico is a real multi-size icon', async ({ page }) => {
    const res = await page.request.get('/favicon.ico');
    expect(res.status()).toBe(200);
    const buf = await res.body();
    expect(buf.readUInt16LE(0)).toBe(0);
    expect(buf.readUInt16LE(2)).toBe(1);
    expect(buf.readUInt16LE(4)).toBeGreaterThanOrEqual(2);
  });

  test('content is present in server-rendered HTML, not injected by script', async ({ page }) => {
    // Link previews and crawlers do not run JavaScript.
    const res = await page.request.get('/about/');
    const html = await res.text();
    expect(html).toContain('Give a Helping Hand');
    expect(html).toContain('Vijayawada');
  });
});
