/**
 * G4: no link in the built site points at a bare social-platform homepage.
 * A link to https://facebook.com/ (no profile path) is misleading to a donor:
 * it looks like the charity's page but goes to the platform's front door.
 */
import fs from 'node:fs';
import path from 'node:path';

const PLATFORMS = [
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'youtube.com',
  'linkedin.com',
];

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

if (!fs.existsSync('dist')) {
  console.error('dist not found - run the build first');
  process.exit(1);
}

const offenders = [];
let checked = 0;

for (const file of walk('dist')) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = m[1];
    let u;
    try {
      u = new URL(url);
    } catch {
      continue;
    }
    const host = u.hostname.replace(/^www\./, '');
    if (!PLATFORMS.includes(host)) continue;
    checked++;
    // A real profile has at least one non-empty path segment.
    if (u.pathname.split('/').filter(Boolean).length === 0) {
      offenders.push(`${file.split(path.sep).join('/')}: ${url}`);
    }
  }
}

if (offenders.length) {
  console.error(`${offenders.length} bare social homepage link(s) found:`);
  offenders.slice(0, 20).forEach((o) => console.error('  ' + o));
  process.exit(1);
}

console.log(`social links checked: ${checked} (0 bare homepages)`);
console.log('SOCIAL_LINKS_OK');
