const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { validateMediaConfiguration } = require('../src/config/media');

const backupRoot = path.resolve(__dirname, '../backups/media');

function walk(root) {
  const files = [];
  const visit = (current) => fs.readdirSync(current, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) visit(fullPath);
    else if (entry.name !== '.gitkeep') files.push(fullPath);
  });
  visit(root);
  return files.sort();
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function manifestFor(root) {
  const files = walk(root).map((filePath) => ({
    path: path.relative(root, filePath).split(path.sep).join('/'),
    size: fs.statSync(filePath).size,
    sha256: hashFile(filePath),
  }));
  return { files, fileCount: files.length, totalBytes: files.reduce((sum, file) => sum + file.size, 0) };
}

function runProcess(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}`);
}

function createArchive(mediaRoot, archivePath) {
  if (process.platform === 'win32') {
    runProcess('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-Command',
      '& { param($source,$destination) Compress-Archive -Path (Join-Path $source "*") -DestinationPath $destination -CompressionLevel Optimal -Force }',
      mediaRoot, archivePath,
    ]);
  } else {
    runProcess('tar', ['-czf', archivePath, '-C', mediaRoot, '.']);
  }
}

function extractArchive(archivePath, restoreRoot) {
  if (process.platform === 'win32') {
    runProcess('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-Command',
      '& { param($archive,$destination) Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force }',
      archivePath, restoreRoot,
    ]);
  } else {
    runProcess('tar', ['-xzf', archivePath, '-C', restoreRoot]);
  }
}

function createBackup() {
  const { mediaRoot } = validateMediaConfiguration();
  fs.mkdirSync(backupRoot, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(backupRoot, process.platform === 'win32' ? `media-${stamp}.zip` : `media-${stamp}.tar.gz`);
  const manifestPath = path.join(backupRoot, `media-${stamp}.manifest.json`);
  const manifest = { version: 1, createdAt: new Date().toISOString(), mediaRoot, archivePath, ...manifestFor(mediaRoot) };
  try {
    createArchive(mediaRoot, archivePath);
  } catch (error) {
    fs.rmSync(archivePath, { force: true });
    throw error;
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ manifestPath, archivePath, fileCount: manifest.fileCount, totalBytes: manifest.totalBytes }, null, 2));
}

function latestManifest() {
  if (!fs.existsSync(backupRoot)) throw new Error('No media backup directory exists.');
  const files = fs.readdirSync(backupRoot).filter((name) => name.endsWith('.manifest.json')).sort();
  if (!files.length) throw new Error('No media backup manifest exists.');
  return path.join(backupRoot, files.at(-1));
}

function verifyBackup(manifestArgument) {
  const manifestPath = manifestArgument ? path.resolve(manifestArgument) : latestManifest();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!fs.existsSync(manifest.archivePath)) throw new Error(`Backup archive is missing: ${manifest.archivePath}`);
  const restoreRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ocseafood-media-restore-'));
  try {
    extractArchive(manifest.archivePath, restoreRoot);
    const restored = manifestFor(restoreRoot);
    const expected = JSON.stringify(manifest.files);
    const actual = JSON.stringify(restored.files);
    if (expected !== actual) throw new Error('Restored files do not match the backup manifest.');
    console.log(JSON.stringify({ verified: true, manifestPath, archivePath: manifest.archivePath, fileCount: restored.fileCount, totalBytes: restored.totalBytes, cleanRestoreDirectory: restoreRoot }, null, 2));
  } finally {
    const safePrefix = `${path.resolve(os.tmpdir())}${path.sep}`;
    if (!path.resolve(restoreRoot).startsWith(safePrefix)) throw new Error('Refusing to remove an unsafe restore path.');
    fs.rmSync(restoreRoot, { recursive: true, force: true });
  }
}

const command = process.argv[2];
if (command === 'create') createBackup();
else if (command === 'verify') verifyBackup(process.argv[3]);
else {
  console.error('Usage: node scripts/media-backup.js <create|verify> [manifest-path]');
  process.exitCode = 1;
}
