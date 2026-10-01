const express = require('express');
const prisma = require('../config/prisma');
const env = require('../config/env');
const logger = require('../utils/logger');

const router = express.Router();

function withTimeout(promise, timeoutMs) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error('Database readiness check timed out.');
      error.code = 'HEALTHCHECK_TIMEOUT';
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function readinessHandler(req, res) {
  try {
    await withTimeout(prisma.$queryRawUnsafe('SELECT 1'), env.HEALTHCHECK_TIMEOUT_MS);
    return res.status(200).json({ status: 'ok', checks: { node: 'ok', database: 'ok' } });
  } catch (error) {
    logger.warn('readiness_check_failed', { requestId: req.requestId, error });
    return res.status(503).json({ status: 'unavailable', checks: { node: 'ok', database: 'unavailable' } });
  }
}

router.get('/live', (req, res) => res.status(200).json({ status: 'ok' }));
router.get('/', readinessHandler);
router.get('/ready', readinessHandler);

module.exports = router;
module.exports.readinessHandler = readinessHandler;
module.exports.withTimeout = withTimeout;
