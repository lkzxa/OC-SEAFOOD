const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = process.cwd();
const src = path.join(root, 'frontend', 'public', 'logo_chuan.png');
const appDir = path.join(root, 'frontend', 'src', 'app');
const publicDir = path.join(root, 'frontend', 'public');

function icoBuffer(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  entries.forEach((entry, index) => {
    const base = index * 16;
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, base);
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, base + 1);
    dir.writeUInt8(0, base + 2);
    dir.writeUInt8(0, base + 3);
    dir.writeUInt16LE(1, base + 4);
    dir.writeUInt16LE(32, base + 6);
    dir.writeUInt32LE(entry.buffer.length, base + 8);
    dir.writeUInt32LE(offset, base + 12);
    offset += entry.buffer.length;
  });
  return Buffer.concat([header, dir, ...entries.map((entry) => entry.buffer)]);
}

(async () => {
  const sizes = [16, 32, 48, 64];
  const entries = [];
  for (const size of sizes) {
    const buffer = await sharp(src)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();
    entries.push({ size, buffer });
  }
  const ico = icoBuffer(entries);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), ico);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
  await sharp(src).resize(32, 32, { fit: 'cover' }).png().toFile(path.join(appDir, 'icon.png'));
  await sharp(src).resize(180, 180, { fit: 'cover' }).png().toFile(path.join(appDir, 'apple-icon.png'));
  await sharp(src).resize(192, 192, { fit: 'cover' }).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(src).resize(512, 512, { fit: 'cover' }).png().toFile(path.join(publicDir, 'icon-512.png'));
  console.log('icons generated');
})();
