/**
 * G6: render every route from the PRODUCTION build and assert layout health.
 *
 * Serves dist/ from an in-process static server on a free port, drives it with
 * Playwright, then always closes the server (including on failure).
 *
 * Asserts, per route, at desktop and mobile widths:
 *   - page responds and has an <h1>
 *   - no horizontal overflow
 *   - the hero image is actually painted (not collapsed)
 *   - no console errors or uncaught page errors
 *   - after scrolling the full page, no [data-reveal] element is still hidden
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const ROUTES = [
  '/',
  '/about/',
  '/services/',
  '/activities/',
  '/certificate/',
  '/csr-fund/',
  '/contact/',
  '/donate/',
  '/privacy-policy/',
  '/terms-conditions/',
  '/refund-policy/',
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const DIST = path.resolve('dist');
if (!fs.existsSync(DIST)) {
  console.error('dist/ not found - run npm run build first');
  process.exit(1);
}

/**
 * Serve the built output directly. Using a local static server rather than the
 * Astro CLI keeps this gate free of subprocess/shell portability problems and
 * still exercises the exact files that get uploaded to Hostinger.
 */
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let file = path.join(DIST, urlPath);

  // Directory URLs resolve to their index.html, matching the host config.
  if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
  else if (!path.extname(file) && fs.existsSync(file + '/index.html'))
    file = path.join(file, 'index.html');

  // Never serve outside dist/.
  if (!path.resolve(file).startsWith(DIST)) {
    res.writeHead(403).end('forbidden');
    return;
  }

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const notFound = path.join(DIST, '404.html');
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { 'content-type': MIME['.html'] }).end(fs.readFileSync(notFound));
    } else {
      res.writeHead(404).end('not found');
    }
    return;
  }

  res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

let browser;
const problems = [];

const shutdown = () => {
  try {
    server.close();
  } catch {
    /* already closed */
  }
};

process.on('exit', shutdown);
process.on('SIGINT', () => { shutdown(); process.exit(130); });

try {
  browser = await chromium.launch();

  for (const [label, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();

    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`${label} ${page.url()}: console error: ${m.text()}`);
    });
    page.on('pageerror', (e) => problems.push(`${label} ${page.url()}: pageerror: ${e.message}`));

    for (const route of ROUTES) {
      const res = await page.goto(base + route, { waitUntil: 'networkidle' });
      if (!res || res.status() >= 400) {
        problems.push(`${label} ${route}: HTTP ${res ? res.status() : 'no response'}`);
        continue;
      }
      await page.waitForTimeout(1400);

      // Drive every ScrollTrigger by walking the full page height.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.7;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 190));
        }
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 800));
      });

      const report = await page.evaluate(() => {
        const issues = [];

        if (document.documentElement.scrollWidth > window.innerWidth + 1) {
          issues.push(
            `horizontal overflow: ${document.documentElement.scrollWidth} > ${window.innerWidth}`,
          );
        }

        const hidden = [
          ...document.querySelectorAll('[data-reveal], [data-reveal-group] > *'),
        ].filter((el) => getComputedStyle(el).visibility === 'hidden');
        if (hidden.length) issues.push(`${hidden.length} element(s) still visibility:hidden`);

        if (!document.querySelector('h1')) issues.push('no <h1>');

        const hero = document.querySelector('.phero, .hero');
        if (hero) {
          const img = hero.querySelector('img');
          if (!img) issues.push('hero has no <img>');
          else {
            const r = img.getBoundingClientRect();
            if (r.width < 10 || r.height < 10)
              issues.push(`hero image collapsed: ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
          // A page hero taller than 3x the viewport means the image escaped its box.
          const hb = hero.getBoundingClientRect();
          if (hb.height > window.innerHeight * 3)
            issues.push(`hero ${Math.round(hb.height)}px tall - image likely out of flow`);
        }

        if (document.querySelector('[data-preloader]')) issues.push('preloader still in DOM');

        return issues;
      });

      report.forEach((i) => problems.push(`${label} ${route}: ${i}`));
    }

    await ctx.close();
  }
} finally {
  if (browser) await browser.close().catch(() => {});
  shutdown();
}

if (problems.length) {
  console.error(`${problems.length} visual problem(s):`);
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}

console.log(`${ROUTES.length} routes x 2 viewports rendered clean`);
console.log('VISUAL_OK');
