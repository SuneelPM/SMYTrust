/** G2: dist/favicon.ico exists and is a real ICO containing at least 2 sizes. */
import fs from 'node:fs';

const p = 'dist/favicon.ico';
if (!fs.existsSync(p)) { console.error(`missing ${p}`); process.exit(1); }

const b = fs.readFileSync(p);
const fail = (m) => { console.error(m); process.exit(1); };

if (b.length < 100) fail(`favicon.ico is only ${b.length} bytes`);
// ICONDIR: reserved(0) type(1=icon) count
if (b.readUInt16LE(0) !== 0 || b.readUInt16LE(2) !== 1) fail('not a valid ICO header');

const count = b.readUInt16LE(4);
if (count < 2) fail(`ICO contains ${count} image(s); expected at least 2 sizes`);

// Validate each directory entry points inside the file.
const sizes = [];
for (let i = 0; i < count; i++) {
  const off = 6 + i * 16;
  const w = b[off] === 0 ? 256 : b[off];
  const bytes = b.readUInt32LE(off + 8);
  const dataOff = b.readUInt32LE(off + 12);
  if (dataOff + bytes > b.length) fail(`ICO entry ${i} points past end of file`);
  sizes.push(w);
}

console.log(`sizes: ${sizes.join(', ')}`);
console.log('FAVICON_OK');
