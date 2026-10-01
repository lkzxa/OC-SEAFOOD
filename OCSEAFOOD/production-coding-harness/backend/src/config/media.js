const fs = require('fs');
const path = require('path');
const env = require('./env');

const developmentMediaRoot = path.resolve(__dirname, '../../uploads');

function getMediaRoot() {
  return env.MEDIA_ROOT ? path.resolve(env.MEDIA_ROOT) : developmentMediaRoot;
}

function validateMediaConfiguration() {
  const mediaRoot = getMediaRoot();

  if (env.MEDIA_PROVIDER === 'local' && env.NODE_ENV === 'production' && (!env.MEDIA_ROOT || !path.isAbsolute(env.MEDIA_ROOT))) {
    throw new Error('MEDIA_ROOT must be an absolute persistent directory in production.');
  }

  if (env.MEDIA_PROVIDER === 'cloudinary') {
    const missing = [
      ['CLOUDINARY_CLOUD_NAME', env.CLOUDINARY_CLOUD_NAME],
      ['CLOUDINARY_API_KEY', env.CLOUDINARY_API_KEY],
      ['CLOUDINARY_API_SECRET', env.CLOUDINARY_API_SECRET],
    ].filter(([, value]) => !value).map(([name]) => name);

    if (missing.length > 0) {
      throw new Error(`Cloudinary media provider is missing: ${missing.join(', ')}`);
    }
  }

  fs.mkdirSync(mediaRoot, { recursive: true });
  fs.accessSync(mediaRoot, fs.constants.R_OK | fs.constants.W_OK);
  return { mediaRoot, provider: env.MEDIA_PROVIDER };
}

module.exports = {
  developmentMediaRoot,
  getMediaRoot,
  validateMediaConfiguration,
};
