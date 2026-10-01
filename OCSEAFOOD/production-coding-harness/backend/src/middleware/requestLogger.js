const crypto = require('crypto');
const logger = require('../utils/logger');
const env = require('../config/env');

function requestLogger(req, res, next) {
  if (env.NODE_ENV === 'test') return next();
  const suppliedRequestId = req.get('x-request-id');
  const requestId = suppliedRequestId && /^[A-Za-z0-9._:-]{1,100}$/.test(suppliedRequestId)
    ? suppliedRequestId
    : crypto.randomUUID();
  const startedAt = process.hrtime.bigint();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.info('http_request_completed', {
      requestId,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });
  next();
}

module.exports = requestLogger;
