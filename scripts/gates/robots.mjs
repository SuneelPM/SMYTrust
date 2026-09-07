/** G1: dist/robots.txt exists, allows crawling, and advertises the sitemap. */
import fs from 'node:fs';

const p = 'dist/robots.txt';
if (!fs.existsSync(p)) { console.error(`missing ${p}`); process.exit(1); }

const txt = fs.readFileSync(p, 'utf8');
const fail = (m) => { console.error(m); process.exit(1); };

if (!/^user-agent:\s*\*/im.test(txt)) fail('robots.txt has no "User-agent: *" group');
if (/^disallow:\s*\/\s*$/im.test(txt)) fail('robots.txt disallows the whole site');

const sitemap = txt.match(/^sitemap:\s*(\S+)/im);
if (!sitemap) fail('robots.txt has no Sitemap: line');

// The advertised sitemap must actually exist in the build.
const url = sitemap[1];
const file = 'dist/' + url.replace(/^https?:\/\/[^/]+\//, '');
if (!fs.existsSync(file)) fail(`sitemap ${url} advertised but ${file} not in build`);

console.log('ROBOTS_OK');
