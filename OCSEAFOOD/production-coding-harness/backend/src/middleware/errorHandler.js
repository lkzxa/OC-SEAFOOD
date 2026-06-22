const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  // Log the error internally
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  const status = err.status || err.statusCode || 500;
  const message = (env.NODE_ENV === 'production' && status === 500) ? 'Internal Server Error' : (err.message || 'Internal Server Error');

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
