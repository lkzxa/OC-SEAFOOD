const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { getMediaRoot } = require('../src/config/media');

const prisma = new PrismaClient();
const projectRoot = path.resolve(__dirname, '../..');
const frontendPublic = path.join(projectRoot, 'frontend', 'public');
const reportPath = path.join(projectRoot, 'reports', 'media-inventory.json');

function splitReferences(value) {
  if (!value) return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function extractHtmlImages(value) {
  if (!value) return [];
  return [...String(value).matchAll(/<img\b[^>]*?\bsrc=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function classifyReference(reference) {
  if (reference.startsWith('/uploads/')) return 'local-upload';
  if (reference.startsWith('/')) return 'bundled-local';
  if (/res\.cloudinary\.com/i.test(reference)) return 'cloudinary';
  if (/googleusercontent\.com/i.test(reference)) return 'googleusercontent';
  if (/images\.unsplash\.com/i.test(reference)) return 'unsplash';
  if (/^https?:\/\//i.test(reference)) return 'external-other';
  return 'invalid';
}

function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) return 'gif';
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (buffer.subarray(0, 5).toString('utf8') === '<?xml' || buffer.subarray(0, 4).toString('utf8') === '<svg') return 'svg';
  return null;
}

function safeLocalPath(root, reference, prefix = '/') {
  const pathname = decodeURIComponent(reference.split('?')[0].split('#')[0]);
  const relative = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname.slice(1);
  const resolved = path.resolve(root, relative);
  const rootWithSeparator = `${path.resolve(root)}${path.sep}`;
  return resolved.startsWith(rootWithSeparator) ? resolved : null;
}

function inspectLocalFile(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return { exists: false, validImage: false };
  }
  const buffer = fs.readFileSync(filePath);
  return {
    exists: true,
    validImage: Boolean(detectImageType(buffer)),
    detectedType: detectImageType(buffer),
    size: buffer.length,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
  };
}

function makeEntry(owner, field, reference, mediaRoot) {
  const kind = classifyReference(reference);
  let local = null;
  if (kind === 'local-upload') local = inspectLocalFile(safeLocalPath(mediaRoot, reference, '/uploads/'));
  if (kind === 'bundled-local') local = inspectLocalFile(safeLocalPath(frontendPublic, reference));
  return { owner, field, reference, kind, ...(local ? { local } : {}) };
}

async function collectDatabaseReferences(mediaRoot) {
  const [users, categories, products, posts, combos] = await Promise.all([
    prisma.user.findMany({ select: { id: true, avatar: true } }),
    prisma.category.findMany({ select: { id: true, banner: true } }),
    prisma.product.findMany({ select: { id: true, image: true } }),
    prisma.blogPost.findMany({ select: { id: true, image: true, content: true } }),
    prisma.combo.findMany({ select: { id: true, image: true } }),
  ]);
  const entries = [];
  const add = (owner, field, refs) => refs.forEach((ref) => entries.push(makeEntry(owner, field, ref, mediaRoot)));
  users.forEach((row) => add(`User:${row.id}`, 'avatar', splitReferences(row.avatar)));
  categories.forEach((row) => add(`Category:${row.id}`, 'banner', splitReferences(row.banner)));
  products.forEach((row) => add(`Product:${row.id}`, 'image', splitReferences(row.image)));
  posts.forEach((row) => {
    add(`BlogPost:${row.id}`, 'image', splitReferences(row.image));
    add(`BlogPost:${row.id}`, 'content', extractHtmlImages(row.content));
  });
  combos.forEach((row) => add(`Combo:${row.id}`, 'image', splitReferences(row.image)));
  return { rowCounts: { users: users.length, categories: categories.length, products: products.length, posts: posts.length, combos: combos.length }, entries };
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  const visit = (current) => fs.readdirSync(current, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) visit(fullPath);
    else if (entry.name !== '.gitkeep') result.push(fullPath);
  });
  visit(root);
  return result;
}

function scanSourceExternalImages() {
  const roots = [path.join(projectRoot, 'frontend', 'src'), path.join(projectRoot, 'backend', 'src')];
  const findings = [];
  roots.flatMap(walkFiles)
    .filter((filePath) => /\.(?:js|jsx|ts|tsx)$/i.test(filePath))
    .forEach((filePath) => {
      const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
      lines.forEach((line, index) => {
        if (/https?:\/\/[^\s"']*(?:googleusercontent\.com|images\.unsplash\.com)[^\s"']*/i.test(line)) {
          findings.push({ file: path.relative(projectRoot, filePath).split(path.sep).join('/'), line: index + 1, text: line.trim() });
        }
      });
    });
  return findings;
}

async function main() {
  const mediaRoot = getMediaRoot();
  const database = await collectDatabaseReferences(mediaRoot);
  const mediaFiles = walkFiles(mediaRoot).map((filePath) => ({
    path: path.relative(mediaRoot, filePath).split(path.sep).join('/'),
    ...inspectLocalFile(filePath),
  }));
  const byKind = database.entries.reduce((counts, entry) => {
    counts[entry.kind] = (counts[entry.kind] || 0) + 1;
    return counts;
  }, {});
  const broken = database.entries.filter((entry) => entry.local && (!entry.local.exists || !entry.local.validImage));
  const uncontrolled = database.entries.filter((entry) => ['googleusercontent', 'unsplash', 'external-other'].includes(entry.kind));
  const invalidFiles = mediaFiles.filter((entry) => !entry.validImage);
  const sourceExternalImages = scanSourceExternalImages();
  const report = {
    generatedAt: new Date().toISOString(),
    mediaRoot,
    database: { ...database, byKind, broken, uncontrolled },
    storage: {
      fileCount: mediaFiles.length,
      totalBytes: mediaFiles.reduce((sum, entry) => sum + entry.size, 0),
      invalidFiles,
      files: mediaFiles,
    },
    sourceExternalImages,
  };
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ reportPath, rowCounts: database.rowCounts, referencesByKind: byKind, broken: broken.length, uncontrolled: uncontrolled.length, sourceExternalImages: sourceExternalImages.length, storageFiles: mediaFiles.length, invalidStorageFiles: invalidFiles.length, totalBytes: report.storage.totalBytes }, null, 2));
  if (process.argv.includes('--strict') && (broken.length || uncontrolled.length || invalidFiles.length || sourceExternalImages.length)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
