/**
 * Validate request body against a Zod schema
 * @param {object} schema - Zod schema
 */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        status: 400,
        details: result.error.format()
      }
    });
  }
  req.body = result.data;
  next();
};

/**
 * Validate request query parameters against a Zod schema
 * @param {object} schema - Zod schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        status: 400,
        details: result.error.format()
      }
    });
  }
  req.query = result.data;
  next();
};

/**
 * Validate request route parameters against a Zod schema
 * @param {object} schema - Zod schema
 */
const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        status: 400,
        details: result.error.format()
      }
    });
  }
  req.params = result.data;
  next();
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
