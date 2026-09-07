/**
 * Build public/favicon.ico (16/32/48px) from the organisation logo.
 * Browsers and crawlers request /favicon.ico directly; without it every page
 * load takes a 404. ICO entries carry PNG payloads, which every current
 * browser supports.
 */
import fs from 'node:fs';
import sharp from 'sharp';

const SRC = 'public/images/logo-removebg-preview.png';
const OUT = 'public/favicon.ico';
const SIZES = [16, 32, 48];

if (!fs.existsSync(SRC)) {
  console.error(`source logo not found: ${SRC}`);
  process.exit(1);
}

// Skip when already newer than the source.
if (fs.existsSync(OUT) && fs.statSync(OUT).mtimeMs >= fs.statSync(SRC).mtimeMs) {
  console.log('favicon.ico up to date');
  process.exit(0);
}

const pngs = [];
for (const size of SIZES) {
  pngs.push(
    await sharp(SRC)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );
}

const count = pngs.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);      // reserved
header.writeUInt16LE(1, 2);      // type 1 = icon
header.writeUInt16LE(count, 4);  // image count

const entries = [];
let offset = 6 + count * 16;

pngs.forEach((png, i) => {
  const size = SIZES[i];
  const e = Buffer.alloc(16);
  e[0] = size >= 256 ? 0 : size;   // width  (0 means 256)
  e[1] = size >= 256 ? 0 : size;   // height
  e[2] = 0;                        // palette colours
  e[3] = 0;                        // reserved
  e.writeUInt16LE(1, 4);           // colour planes
  e.writeUInt16LE(32, 6);          // bits per pixel
  e.writeUInt32LE(png.length, 8);  // payload size
  e.writeUInt32LE(offset, 12);     // payload offset
  entries.push(e);
  offset += png.length;
});

fs.writeFileSync(OUT, Buffer.concat([header, ...entries, ...pngs]));
console.log(`favicon.ico written (${SIZES.join('/')}px, ${fs.statSync(OUT).size} bytes)`);
