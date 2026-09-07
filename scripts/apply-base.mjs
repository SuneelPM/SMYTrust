/**
 * Codemod: route every hand-written internal href/src through withBase(), so
 * the site works both at an apex domain and under a GitHub Pages base path.
 *
 * Rewrites:
 *   href="/about/"        -> href={u('/about/')}
 *   src={org.logo}        -> src={u(org.logo)}        (known path-valued props)
 * and adds the import where needed.
 *
 * Astro-managed asset imports are already base-aware and are left alone.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'src';

/** Expressions that are known to hold a root-relative path. */
const PATH_EXPRESSIONS = [
  'org.logo',
  'item.href',
  'n.href',
  'l.href',
  's.href',
  'c.image',
  'g.src',
  'p.src',
  'm.image',
  's.image',
  'about.image',
  'about.secondaryImage',
  'image',
  'src',
];

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.astro$/.test(e.name)) out.push(p);
  }
  return out;
}

let changedFiles = 0;
let changedLinks = 0;

for (const file of walk(ROOT)) {
  const before = fs.readFileSync(file, 'utf8');
  let src = before;

  // 1. Literal root-relative href/src attributes.
  src = src.replace(/\b(href|src)="(\/[^"]*)"/g, (m, attr, value) => {
    changedLinks++;
    return `${attr}={u('${value}')}`;
  });

  // 2. Known path-valued expressions: href={x} / src={x} -> {u(x)}
  for (const expr of PATH_EXPRESSIONS) {
    const escaped = expr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b(href|src)=\\{${escaped}\\}`, 'g');
    src = src.replace(re, (m, attr) => {
      changedLinks++;
      return `${attr}={u(${expr})}`;
    });
  }

  if (src === before) continue;

  // 3. Ensure the helper is imported (frontmatter fence must already exist).
  if (!/from '.*lib\/url'/.test(src)) {
    const depth = path.relative(path.dirname(file), path.join(ROOT, 'lib')).split(path.sep);
    const rel = depth.join('/').replace(/\\/g, '/') || '.';
    const importPath = (rel.startsWith('.') ? rel : './' + rel) + '/url';

    if (/^---\r?\n/.test(src)) {
      src = src.replace(/^---\r?\n/, `---\nimport { u } from '${importPath}';\n`);
    } else {
      src = `---\nimport { u } from '${importPath}';\n---\n\n` + src;
    }
  }

  fs.writeFileSync(file, src);
  changedFiles++;
  console.log(`  ${file.split(path.sep).join('/')}`);
}

console.log(`\n${changedLinks} link(s) rewritten across ${changedFiles} file(s)`);
