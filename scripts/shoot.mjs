/**
 * Visual check: screenshot every route at desktop + mobile and report
 * layout problems that only show up once the page is actually rendered.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = '.shots';
const routes = [
  '/',
  '/about/',
  '/services/',
  '/activities/',
  '/certificate/',
  '/csr-fund/',
  '/contact/',
  '/donate/',
  '/privacy-policy/',
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const [label, viewport] of [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console error @ ${page.url()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror @ ${page.url()}: ${e.message}`));

  for (const route of routes) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    // let the preloader finish and reveals settle
    await page.waitForTimeout(1600);

    const name = route.replace(/\//g, '_') || '_home';
    await page.screenshot({ path: `${OUT}/${label}${name}.png`, fullPage: false });

    // --- automated layout assertions -------------------------------------
    const report = await page.evaluate(() => {
      const out = { route: location.pathname, issues: [] };

      // horizontal overflow
      if (document.documentElement.scrollWidth > window.innerWidth + 1) {
        out.issues.push(
          `horizontal overflow: scrollWidth ${document.documentElement.scrollWidth} > viewport ${window.innerWidth}`,
        );
      }

      // elements still invisible after reveals should have finished
      const hidden = [...document.querySelectorAll('[data-reveal], [data-reveal-group] > *')].filter(
        (el) => getComputedStyle(el).visibility === 'hidden',
      );
      if (hidden.length) out.issues.push(`${hidden.length} element(s) still visibility:hidden`);

      // page hero: is the background image actually painted behind the text?
      const hero = document.querySelector('.phero, .hero');
      if (hero) {
        const img = hero.querySelector('img');
        const h1 = hero.querySelector('h1');
        if (img) {
          const r = img.getBoundingClientRect();
          if (r.width < 10 || r.height < 10)
            out.issues.push(`hero image collapsed: ${Math.round(r.width)}x${Math.round(r.height)}`);
          if (getComputedStyle(img).display === 'none') out.issues.push('hero image display:none');
        } else {
          out.issues.push('hero has no <img>');
        }
        if (h1) {
          const hr = h1.getBoundingClientRect();
          if (hr.height < 5) out.issues.push('hero h1 collapsed');
          // contrast sanity: heading should be light on a dark hero
          const c = getComputedStyle(h1).color;
          out.h1Color = c;
          out.h1Text = h1.textContent.trim().slice(0, 40);
        }
        const hb = hero.getBoundingClientRect();
        out.heroHeight = Math.round(hb.height);
      }

      // preloader must be gone
      if (document.querySelector('[data-preloader]')) out.issues.push('preloader still in DOM');

      // sticky header should not cover the h1
      const header = document.querySelector('[data-header]');
      const h1el = document.querySelector('h1');
      if (header && h1el) {
        const hb = header.getBoundingClientRect();
        const tb = h1el.getBoundingClientRect();
        if (tb.top < hb.bottom && tb.bottom > hb.top && hb.height > 0) {
          out.issues.push(
            `header overlaps h1 (header bottom ${Math.round(hb.bottom)}, h1 top ${Math.round(tb.top)})`,
          );
        }
      }

      return out;
    });

    if (report.issues.length) {
      problems.push(`${label} ${report.route}: ${report.issues.join(' | ')}`);
    }
    console.log(
      `${label.padEnd(7)} ${report.route.padEnd(18)} hero:${String(report.heroHeight ?? '-').padStart(4)}px  h1:${report.h1Color ?? '-'}  ${report.issues.length ? 'ISSUES' : 'ok'}`,
    );
  }

  await ctx.close();
}

await browser.close();

console.log('\n--- problems ---');
if (!problems.length) console.log('none');
else problems.forEach((p) => console.log('  ' + p));
