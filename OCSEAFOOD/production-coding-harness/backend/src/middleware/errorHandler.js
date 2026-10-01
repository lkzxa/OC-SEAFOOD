const env = require('../config/env');
const logger = require('../utils/logger');

const SAFE_PRODUCTION_MESSAGES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Resource not found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
};

const normalizeStatus = (err) => {
  const candidate = Number(err.status || err.statusCode || 500);
  return Number.isInteger(candidate) && candidate >= 400 && candidate <= 599
    ? candidate
    : 500;
};

const getPublicMessage = (err, status) => {
  if (env.NODE_ENV !== 'production') {
    return err.message || 'Internal Server Error';
  }

  if (status >= 500) return 'Internal Server Error';
  return SAFE_PRODUCTION_MESSAGES[status] || 'Request failed';
};

const errorHandler = (err, req, res, next) => {
  logger.error('http_request_failed', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl.split('?')[0],
    error: err,
  });

  const status = normalizeStatus(err);
  const message = getPublicMessage(err, status);

  const response = {
    error: {
      message,
      status
    }
  };

  // Stack trace is only exposed in non-production environments
  if (env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
  }

  res.status(status).json(response);
};

module.exports = errorHandler;
