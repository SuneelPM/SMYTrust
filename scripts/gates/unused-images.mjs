/** G3: every file shipped in dist/images is referenced by at least one built page. */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const IMG = path.join(DIST, 'images');
if (!fs.existsSync(IMG)) { console.error('dist/images not found - run the build first'); process.exit(1); }

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// Every text artifact that can reference an image: HTML, CSS, JS, XML.
const haystack = walk(DIST)
  .filter((f) => /\.(html|css|js|xml|txt|webmanifest)$/i.test(f))
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');

const images = fs.readdirSync(IMG);
const unused = images.filter((f) => !haystack.includes(f));

// Generated WebP variants ship too. A variant whose source image was removed
// is dead weight that no page can ever request.
const OPT = path.join(DIST, 'opt');
const liveStems = new Set(images.map((f) => f.replace(/\.[^.]+$/, '')));
const orphanVariants = fs.existsSync(OPT)
  ? fs.readdirSync(OPT).filter((v) => {
      const m = v.match(/^(.+)-\d+\.webp$/);
      return m && !liveStems.has(m[1]);
    })
  : [];

let failed = false;

if (unused.length) {
  console.error(`${unused.length} unreferenced image(s) shipped in dist/images:`);
  unused.slice(0, 40).forEach((f) => console.error('  ' + f));
  failed = true;
}

if (orphanVariants.length) {
  console.error(`${orphanVariants.length} orphaned WebP variant(s) in dist/opt:`);
  orphanVariants.slice(0, 20).forEach((f) => console.error('  ' + f));
  failed = true;
}

if (failed) process.exit(1);

console.log(
  `all ${images.length} shipped images referenced; ${fs.existsSync(OPT) ? fs.readdirSync(OPT).length : 0} variants all have a live source`,
);
console.log('UNUSED_IMAGES_OK');
