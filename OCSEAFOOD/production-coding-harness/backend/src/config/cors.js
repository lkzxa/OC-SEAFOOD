const env = require('./env');

function getAllowedOrigins(runtimeEnv = env) {
  const raw = runtimeEnv.CORS_ORIGIN;
  if (!raw) {
    if (runtimeEnv.NODE_ENV === 'production') throw new Error('CORS_ORIGIN is required in production.');
    return ['http://localhost:3000', 'http://localhost:3001'];
  }

  const origins = [...new Set(raw.split(',').map((origin) => origin.trim()).filter(Boolean))];
  if (!origins.length || origins.includes('*')) throw new Error('CORS_ORIGIN must contain explicit origins and cannot use wildcard.');
  for (const origin of origins) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`CORS_ORIGIN contains an invalid origin: ${origin}`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
      throw new Error(`CORS_ORIGIN must contain origins without paths: ${origin}`);
    }
  }
  return origins;
}

module.exports = { getAllowedOrigins };
