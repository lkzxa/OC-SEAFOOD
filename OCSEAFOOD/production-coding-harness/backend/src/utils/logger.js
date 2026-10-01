const env = require('../config/env');

const SECRET_KEY_PATTERN = /authorization|cookie|pass(?:word)?|secret|token|api[_-]?key|access[_-]?token|database[_-]?url/i;

function redactText(value) {
  return String(value)
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/([?&\s](?:token|password|secret|api[_-]?key)=)[^&\s]+/gi, '$1[REDACTED]');
}

function sanitize(value, key = '', seen = new WeakSet()) {
  if (SECRET_KEY_PATTERN.test(key)) return '[REDACTED]';
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message),
      ...(value.code ? { code: value.code } : {}),
      ...(value.stack ? { stack: redactText(value.stack) } : {}),
    };
  }
  if (typeof value === 'string') return redactText(value);
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => sanitize(item, '', seen));
  return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, sanitize(childValue, childKey, seen)]));
}

function write(level, event, details = {}) {
  const entry = sanitize({ timestamp: new Date().toISOString(), level, event, ...details });
  const method = level === 'error' || level === 'fatal' ? 'error' : level === 'warn' ? 'warn' : 'log';
  if (env.NODE_ENV === 'production') console[method](JSON.stringify(entry));
  else console[method](`[${level.toUpperCase()}] ${event}`, entry);
}

module.exports = {
  debug: (event, details) => write('debug', event, details),
  info: (event, details) => write('info', event, details),
  warn: (event, details) => write('warn', event, details),
  error: (event, details) => write('error', event, details),
  fatal: (event, details) => write('fatal', event, details),
  redactText,
  sanitize,
};
