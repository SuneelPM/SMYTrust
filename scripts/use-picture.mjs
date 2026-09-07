/**
 * One-off codemod: swap plain <img src="/images/..."> for the responsive
 * <Picture> component across pages and components, and add the import.
 * Images inside the Icon component and any <picture> already present are left alone.
 */
import fs from 'node:fs';
import path from 'node:path';

const targets = [
  ['src/components/HeroCarousel.astro', '../components/Picture.astro', './Picture.astro'],
  ['src/components/PageHero.astro', null, './Picture.astro'],
  ['src/components/CtaBand.astro', null, './Picture.astro'],
  ['src/pages/index.astro', null, '../components/Picture.astro'],
  ['src/pages/about.astro', null, '../components/Picture.astro'],
  ['src/pages/services.astro', null, '../components/Picture.astro'],
  ['src/pages/csr-fund.astro', null, '../components/Picture.astro'],
  ['src/pages/gallery.astro', null, '../components/Picture.astro'],
  ['src/pages/activities.astro', null, '../components/Picture.astro'],
  ['src/pages/certificate.astro', null, '../components/Picture.astro'],
];

/** Convert one <img ...> tag into <Picture ... /> preserving attributes. */
function toPicture(tag, sizes) {
  // Skip images that are not local /images assets.
  if (!/src=["'{]/.test(tag)) return tag;
  if (/data-no-opt/.test(tag)) return tag;

  let inner = tag.replace(/^<img\s*/, '').replace(/\/?>$/, '').trim();

  // Astro components need self-closing syntax.
  if (!/\bsizes=/.test(inner) && sizes) inner += ` sizes="${sizes}"`;

  return `<Picture ${inner} />`;
}

for (const [file, , importPath] of targets) {
  if (!fs.existsSync(file)) {
    console.warn(`  missing: ${file}`);
    continue;
  }

  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  // Pick a sensible default `sizes` per file.
  const sizes = /HeroCarousel|PageHero|CtaBand/.test(file)
    ? '100vw'
    : /gallery|activities|certificate/.test(file)
      ? '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'
      : '(min-width: 1024px) 50vw, 100vw';

  src = src.replace(/<img\b[^>]*>/g, (tag) => toPicture(tag, sizes));

  if (src === before) {
    console.log(`  no <img> tags: ${file}`);
    continue;
  }

  // Add the import if it is not already there.
  if (!/from ['"].*Picture\.astro['"]/.test(src)) {
    src = src.replace(/^---\n/, `---\nimport Picture from '${importPath}';\n`);
  }

  fs.writeFileSync(file, src);
  const count = (before.match(/<img\b/g) || []).length;
  console.log(`  ${file}: ${count} image(s) -> <Picture>`);
}

console.log('\ndone');
