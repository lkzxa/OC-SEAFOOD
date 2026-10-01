const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const app = require('../app');
const env = require('../config/env');
const { signToken } = require('../utils/jwt');
const { detectImageExtension } = require('../routes/upload');
const { validateMediaConfiguration } = require('../config/media');

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

describe('media upload', () => {
  let tempRoot;
  let originalRoot;
  let originalProvider;
  let originalNodeEnv;

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ocseafood-upload-'));
    originalRoot = env.MEDIA_ROOT;
    originalProvider = env.MEDIA_PROVIDER;
    originalNodeEnv = env.NODE_ENV;
    env.MEDIA_ROOT = tempRoot;
    env.MEDIA_PROVIDER = 'local';
  });

  afterEach(() => {
    env.MEDIA_ROOT = originalRoot;
    env.MEDIA_PROVIDER = originalProvider;
    env.NODE_ENV = originalNodeEnv;
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('stores a verified image under a collision-resistant name', async () => {
    const token = signToken({ id: 1, email: 'admin@example.com', role: 'ADMIN' });
    const response = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', png, { filename: '../../unsafe-name.png', contentType: 'image/png' })
      .expect(201);

    expect(response.body.url).toMatch(/^\/uploads\/[a-f0-9]{32}\.png$/);
    const stored = path.join(tempRoot, path.basename(response.body.url));
    expect(fs.readFileSync(stored)).toEqual(png);
  });

  it('rejects a forged image payload even when its MIME type says image', async () => {
    const token = signToken({ id: 1, email: 'admin@example.com', role: 'ADMIN' });
    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('not an image'), { filename: 'fake.png', contentType: 'image/png' })
      .expect(400);
  });

  it('allows only administrators to upload', async () => {
    const token = signToken({ id: 2, email: 'customer@example.com', role: 'CUSTOMER' });
    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', png, { filename: 'photo.png', contentType: 'image/png' })
      .expect(403);
  });

  it('requires an image file', async () => {
    const token = signToken({ id: 1, email: 'admin@example.com', role: 'ADMIN' });
    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('rejects images larger than 5 MiB', async () => {
    const token = signToken({ id: 1, email: 'admin@example.com', role: 'ADMIN' });
    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.alloc((5 * 1024 * 1024) + 1, 1), { filename: 'large.png', contentType: 'image/png' })
      .expect(413);
  });

  it('recognizes the four supported raster image formats by signature', () => {
    expect(detectImageExtension(png)).toBe('png');
    expect(detectImageExtension(Buffer.from([0xff, 0xd8, 0xff, ...Array(9).fill(0)]))).toBe('jpg');
    expect(detectImageExtension(Buffer.from('GIF89a000000'))).toBe('gif');
    expect(detectImageExtension(Buffer.from('RIFF0000WEBP'))).toBe('webp');
  });

  it('requires an absolute persistent media directory in production', () => {
    env.NODE_ENV = 'production';
    env.MEDIA_ROOT = 'relative/uploads';
    expect(() => validateMediaConfiguration()).toThrow(/absolute persistent directory/);
  });
});
