/**
 * Minimal static server for the built site, used by the Playwright suite.
 *
 * Serving dist/ directly (rather than the Astro CLI) keeps the tests free of
 * subprocess/shell portability problems and exercises the exact files that get
 * uploaded to the host. Directory URLs resolve to index.html and unknown paths
 * return the real 404 page, matching the production host configuration.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const DIST = path.resolve('dist');
const PORT = Number(process.env.PORT || 4331);

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

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found - run `npm run build` first');
  process.exit(1);
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(DIST, urlPath);

    if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
    else if (!path.extname(file) && fs.existsSync(file + '/index.html'))
      file = path.join(file, 'index.html');

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

    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    });
    res.end(fs.readFileSync(file));
  })
  .listen(PORT, '127.0.0.1', () => console.log(`serving dist/ on http://127.0.0.1:${PORT}`));
