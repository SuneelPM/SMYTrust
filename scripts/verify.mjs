/**
 * Post-build verification.
 * Checks that every internal link resolves, every referenced image exists,
 * no external hotlinks to the old WordPress site remain, and each page
 * carries the SEO tags we expect.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
/**
 * When the site is built under a base path (GitHub Pages serves from
 * /<repo>/), every internal href carries that prefix. Strip it before
 * resolving against dist/ so the same checks work for both deployments.
 */
const BASE = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');
const stripBase = (href) =>
  BASE && href.startsWith(BASE + '/') ? href.slice(BASE.length) : href;

const fail = [];
const warn = [];

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const pages = walk(DIST);
const routeOf = (f) =>
  '/' + path.relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');

const routes = new Set(pages.map(routeOf));

console.log(`Checking ${pages.length} pages\n`);

for (const file of pages) {
  // Comments are not markup - strip them so their contents are never linted.
  const html = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const route = routeOf(file);

  // --- internal links resolve ---
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    let href = stripBase(m[1]);
    if (!href.endsWith('/') && !path.extname(href)) href += '/';

    if (path.extname(href)) {
      // static asset
      const asset = path.join(DIST, decodeURIComponent(href));
      if (!fs.existsSync(asset)) fail.push(`${route} -> missing asset ${href}`);
    } else if (!routes.has(href)) {
      fail.push(`${route} -> broken link ${href}`);
    }
  }

  // --- images exist and have alt attributes ---
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const src = tag.match(/src="([^"]+)"/)?.[1];
    if (src?.startsWith('/')) {
      const asset = path.join(DIST, decodeURIComponent(stripBase(src)));
      if (!fs.existsSync(asset)) fail.push(`${route} -> missing image ${src}`);
    }
    // A bare `alt` attribute is valid HTML and means alt="" (decorative image).
    if (!/\salt(?:=|[\s/>])/.test(tag))
      fail.push(`${route} -> <img> without alt: ${tag.slice(0, 90)}`);
  }

  // --- no hotlinks to the old site ---
  if (/smyservices\.org\/wp-content/.test(html)) {
    fail.push(`${route} -> hotlinks the old WordPress media library`);
  }
  if (/app-preview\.com|horizons\.hostinger/.test(html)) {
    fail.push(`${route} -> references a preview host`);
  }

  // --- SEO essentials ---
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fail.push(`${route} -> missing/short <title>`);
  if (!/<meta name="description" content="[^"]{40,}"/.test(html))
    fail.push(`${route} -> missing/short meta description`);
  if (!/rel="canonical"/.test(html)) fail.push(`${route} -> missing canonical`);
  if (!/property="og:image"/.test(html)) warn.push(`${route} -> no og:image`);
  const h1s = html.match(/<h1\b/g)?.length ?? 0;
  if (h1s === 0) warn.push(`${route} -> no <h1>`);
  if (h1s > 1 && route !== '/') warn.push(`${route} -> ${h1s} <h1> elements`);
}

/**
 * Orphaned scoped selectors.
 *
 * Astro compiles a component's `<style>` rules to `.cls[data-astro-cid-XXXX]`.
 * If that class is passed as a prop into a CHILD component, the element it
 * lands on never receives the parent's scope id, so the rule silently matches
 * nothing. This has already caused two production bugs (footer icons rendering
 * at 300x150, page-hero images escaping their absolute positioning), so it is
 * checked on every build.
 */
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const route = routeOf(file);

  // Collect the CSS that applies to this page: inline <style> plus linked files.
  let css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  for (const m of html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)) {
    const p = path.join(DIST, m[1]);
    if (fs.existsSync(p)) css += '\n' + fs.readFileSync(p, 'utf8');
  }

  const seen = new Set();
  for (const m of css.matchAll(/\.([A-Za-z_][\w-]*)\[(data-astro-cid-[a-z0-9]+)\]/g)) {
    const [, cls, cid] = m;
    const key = `${cls}|${cid}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Does any element carry BOTH this class and this scope id?
    const tags = html.match(/<[a-zA-Z][^>]*>/g) || [];
    const matched = tags.some((t) => {
      if (!t.includes(cid)) return false;
      const cm = t.match(/\sclass="([^"]*)"/);
      return cm ? cm[1].split(/\s+/).includes(cls) : false;
    });

    // Only report if the class IS used somewhere unscoped — that is the
    // signature of a class handed to a child component.
    if (!matched) {
      const usedUnscoped = tags.some((t) => {
        const cm = t.match(/\sclass="([^"]*)"/);
        return cm ? cm[1].split(/\s+/).includes(cls) : false;
      });
      if (usedUnscoped) {
        fail.push(
          `${route} -> scoped rule .${cls}[${cid}] matches nothing, but class "${cls}" is used on an element without that scope id (class passed into a child component?)`,
        );
      }
    }
  }
}

// --- unused images (informational) ---
const allHtml = pages.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const imgDir = path.join(DIST, 'images');
if (fs.existsSync(imgDir)) {
  const unused = fs.readdirSync(imgDir).filter((f) => !allHtml.includes(f));
  if (unused.length) warn.push(`${unused.length} images in /images are not referenced by any page`);
}

for (const w of warn) console.log(`  warn  ${w}`);
if (warn.length) console.log('');

if (fail.length) {
  for (const f of fail) console.error(`  FAIL  ${f}`);
  console.error(`\n${fail.length} error(s).`);
  process.exit(1);
}

console.log(`VERIFY OK — ${pages.length} pages, ${routes.size} routes, 0 errors.`);
