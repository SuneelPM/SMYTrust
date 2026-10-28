/**
 * Computes a Content-Security-Policy for the static build and writes it into
 * dist/_headers. Runs after `astro build` (which already copied public/_headers
 * into dist/) and before scripts/verify.mjs.
 *
 * Inline <script> content on this site is fixed JS (menu toggle, bio
 * read-more, preloader class flip, a tiny redirect snippet) — never user
 * input — so each distinct inline script is allow-listed by its SHA-256
 * hash instead of using 'unsafe-inline'. JSON-LD <script type="application/
 * ld+json"> blocks are data, not script, and are excluded (CSP's script-src
 * does not gate them). The single small inline <style> block (the preloader's
 * critical CSS) is likewise hash-allowed. Everything else — hundreds of
 * `style="..."` attributes used for CSS custom-property theming — needs
 * 'unsafe-inline' in style-src; CSP cannot hash attribute styles without the
 * non-standard 'unsafe-hashes' keyword, and that is this site's one
 * unavoidable relaxation.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1');
const HEADERS_FILE = join(DIST, '_headers');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

function sha256base64(text) {
  return createHash('sha256').update(text, 'utf8').digest('base64');
}

const htmlFiles = walk(DIST);
const scriptHashes = new Set();
const styleHashes = new Set();

const scriptRe = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/g;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');

  let m;
  while ((m = scriptRe.exec(html))) {
    const [, attrs, body] = m;
    if (/type\s*=\s*"application\/ld\+json"/.test(attrs)) continue; // data, not executable
    if (!body.trim()) continue;
    scriptHashes.add(sha256base64(body));
  }

  while ((m = styleRe.exec(html))) {
    const body = m[1];
    if (!body.trim()) continue;
    styleHashes.add(sha256base64(body));
  }
}

const scriptSrc = [
  "'self'",
  ...[...scriptHashes].sort().map((h) => `'sha256-${h}'`),
].join(' ');

const styleSrc = [
  "'self'",
  "'unsafe-inline'", // required for CSS custom-property style="" attributes; see file header
  'https://fonts.googleapis.com',
  ...[...styleHashes].sort().map((h) => `'sha256-${h}'`),
].join(' ');

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  `style-src ${styleSrc}`,
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.web3forms.com",
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://api.web3forms.com",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

let headers = readFileSync(HEADERS_FILE, 'utf8');

if (/Content-Security-Policy:/.test(headers)) {
  headers = headers.replace(/^\s*Content-Security-Policy:.*$/m, `  Content-Security-Policy: ${csp}`);
} else {
  headers = headers.replace(
    /(Strict-Transport-Security: max-age=31536000; includeSubDomains\n)/,
    `$1  Content-Security-Policy: ${csp}\n`,
  );
}

writeFileSync(HEADERS_FILE, headers);

console.log(
  `CSP written to dist/_headers — ${scriptHashes.size} script hash(es), ${styleHashes.size} style hash(es).`,
);
