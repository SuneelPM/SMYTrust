/**
 * Generates responsive WebP variants for every image in public/images,
 * including subdirectories such as public/images/gallery.
 *
 * Output: public/opt/<relative-name>-<width>.webp (directory structure mirrored)
 * Results are cached — a variant is only rebuilt when the source file is newer.
 * Run automatically before every build via the `prebuild` npm script.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'public/images';
const OUT = 'public/opt';
const WIDTHS = [480, 768, 1200, 1920];
const QUALITY = 74;

fs.mkdirSync(OUT, { recursive: true });

/** Recursively list image files under `dir`, returned as paths relative to SRC (posix separators). */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      out.push(path.relative(SRC, full).split(path.sep).join('/'));
    }
  }
  return out;
}

const files = walk(SRC).sort();

let built = 0;
let skipped = 0;
let srcBytes = 0;
let outBytes = 0;

for (const rel of files) {
  const srcPath = path.join(SRC, rel);
  const stat = fs.statSync(srcPath);
  srcBytes += stat.size;

  let meta;
  try {
    meta = await sharp(srcPath).metadata();
  } catch {
    console.warn(`  skip (unreadable): ${rel}`);
    continue;
  }

  const base = rel.replace(/\.[^.]+$/, '');
  fs.mkdirSync(path.join(OUT, path.dirname(base)), { recursive: true });

  // Also emit a variant at the source's own width when it falls between our
  // breakpoints, so large screens still get a sharp image instead of upscaling.
  const widths = new Set(WIDTHS.filter((w) => !meta.width || w <= meta.width));
  if (meta.width && meta.width < Math.max(...WIDTHS)) widths.add(meta.width);
  if (widths.size === 0) widths.add(WIDTHS[0]);

  for (const w of [...widths].sort((a, b) => a - b)) {
    // Never upscale beyond the source width.
    if (meta.width && w > meta.width && w !== WIDTHS[0]) continue;

    const outPath = path.join(OUT, `${base}-${w}.webp`);

    if (fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs >= stat.mtimeMs) {
      outBytes += fs.statSync(outPath).size;
      skipped++;
      continue;
    }

    await sharp(srcPath)
      .rotate() // apply EXIF orientation so phone photos aren't sideways
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(outPath);

    outBytes += fs.statSync(outPath).size;
    built++;
  }
}

// Drop variants whose source image no longer exists, so a removed photo does
// not keep shipping its WebP derivatives.
const liveStems = new Set(files.map((f) => f.replace(/\.[^.]+$/, '')));
let pruned = 0;
function pruneDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pruneDir(full);
      continue;
    }
    const m = entry.name.match(/^(.+)-\d+\.webp$/);
    if (!m) continue;
    const stem = path.join(path.relative(OUT, dir), m[1]).split(path.sep).join('/');
    if (!liveStems.has(stem)) {
      fs.unlinkSync(full);
      pruned++;
    }
  }
}
pruneDir(OUT);

const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
console.log(
  `images: ${files.length} sources (${mb(srcBytes)}) -> ${built} built, ${skipped} cached, ${pruned} pruned, ${mb(outBytes)} of WebP variants`,
);
