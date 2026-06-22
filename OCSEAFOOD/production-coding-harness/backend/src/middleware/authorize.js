/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - The list of roles allowed to access the endpoint
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user details are present (set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized: Missing or invalid token',
          status: 401
        }
      });
    }

    // 2. Check if the user's role is permitted
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Forbidden: You do not have permission to access this resource',
          status: 403
        }
      });
    }

    // 3. User is authorized, proceed to next handler
    next();
  };
};

module.exports = authorize;
