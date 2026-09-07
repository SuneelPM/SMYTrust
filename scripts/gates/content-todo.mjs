/**
 * G7: CONTENT-TODO.md must describe exactly the items still blocked on the
 * organisation, and must not claim an item is outstanding once the repository
 * shows it resolved. Each rule below is measured from the repo, not from the
 * document, so the document cannot certify itself.
 */
import fs from 'node:fs';

const fail = (m) => { console.error(m); process.exit(1); };
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');

const todo = read('CONTENT-TODO.md');
if (!todo) fail('CONTENT-TODO.md is missing');

const site = read('src/data/site.ts');
if (!site) fail('src/data/site.ts is missing');

const problems = [];

// --- 1. Contact form: still blocked while no key is configured -------------
const hasKey = Boolean(process.env.PUBLIC_WEB3FORMS_KEY) || /^PUBLIC_WEB3FORMS_KEY=.+/m.test(read('.env'));
const mentionsWeb3 = /PUBLIC_WEB3FORMS_KEY/.test(todo);
if (!hasKey && !mentionsWeb3) problems.push('no Web3Forms key configured but CONTENT-TODO.md does not list it');
if (hasKey && mentionsWeb3) problems.push('Web3Forms key IS configured but CONTENT-TODO.md still lists it as outstanding');

// --- 2. Social links: outstanding only while none are real -----------------
// Matches both `export const social = [...] as const;` and an annotated
// `export const social: SocialLink[] = [...];`
const socialBlock = site.match(/export const social\b[^=]*=\s*\[([\s\S]*?)\n\](?:\s*as const)?\s*;/);
if (!socialBlock) fail('could not locate the social array in src/data/site.ts');

const entryCount = [...socialBlock[1].matchAll(/\bname:\s*'/g)].length;
if (entryCount === 0) fail('the social array in src/data/site.ts has no entries');

// `href: null` means "not supplied yet" and is intentionally not a link.
const hrefs = [...socialBlock[1].matchAll(/href:\s*'([^']*)'/g)].map((m) => m[1]);
const nullHrefs = [...socialBlock[1].matchAll(/href:\s*null/g)].length;
if (hrefs.length + nullHrefs !== entryCount)
  fail(`social array has ${entryCount} entries but ${hrefs.length + nullHrefs} parsable hrefs`);
const realProfiles = hrefs.filter((h) => {
  if (!h) return false;
  try {
    return new URL(h).pathname.split('/').filter(Boolean).length > 0;
  } catch {
    return false;
  }
});
const mentionsSocial = /social media/i.test(todo);
if (realProfiles.length === 0 && !mentionsSocial)
  problems.push('no real social profile URLs set but CONTENT-TODO.md does not list them');
if (realProfiles.length === hrefs.length && hrefs.length > 0 && mentionsSocial)
  problems.push('all social URLs are real but CONTENT-TODO.md still lists them as outstanding');

// Placeholder social entries must never be a bare platform homepage.
const bare = hrefs.filter((h) => {
  if (!h) return false;
  try {
    return new URL(h).pathname.split('/').filter(Boolean).length === 0;
  } catch {
    return false;
  }
});
if (bare.length) problems.push(`${bare.length} social entr(y/ies) still point at a bare platform homepage: ${bare.join(', ')}`);

// --- 3. Statistics still flagged as unconfirmed -----------------------------
if (!/statistic/i.test(todo)) problems.push('CONTENT-TODO.md does not flag the unverified statistics');

// --- 4. The no-fabrication position must remain recorded --------------------
if (!/testimonial/i.test(todo)) problems.push('CONTENT-TODO.md no longer records the testimonials/news decision');

// --- 5. Every outstanding item must name a real file it applies to ----------
for (const m of todo.matchAll(/`(src\/[^`]+|public\/[^`]+|scripts\/[^`]+)`/g)) {
  const p = m[1].replace(/\s.*$/, '');
  if (!fs.existsSync(p)) problems.push(`CONTENT-TODO.md references ${p} which does not exist`);
}

if (problems.length) {
  console.error(`${problems.length} CONTENT-TODO.md problem(s):`);
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}

console.log(`outstanding items verified against the repository (${realProfiles.length}/${hrefs.length} social URLs real)`);
console.log('CONTENT_TODO_OK');
