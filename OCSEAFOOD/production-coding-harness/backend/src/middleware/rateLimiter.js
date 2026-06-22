const rateLimit = require('express-rate-limit');

/**
 * Standard normalized error handler for rate limit violations
 */
const rateLimitHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    error: {
      message: options.message,
      status: options.statusCode
    }
  });
};

// 5 requests per 15 minutes on auth endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later',
  statusCode: 429,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// 5 requests per 15 minutes on checkout endpoints
const checkoutRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later',
  statusCode: 429,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Fast limiters for test suite (3 requests per second)
const testAuthRateLimiter = rateLimit({
  windowMs: 1000,
  max: 3,
  message: 'Too many requests, please try again later',
  statusCode: 429,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

const testCheckoutRateLimiter = rateLimit({
  windowMs: 1000,
  max: 3,
  message: 'Too many requests, please try again later',
  statusCode: 429,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authRateLimiter,
  checkoutRateLimiter,
  testAuthRateLimiter,
  testCheckoutRateLimiter,
};
