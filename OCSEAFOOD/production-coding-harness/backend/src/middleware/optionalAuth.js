const { verifyToken } = require('../utils/jwt');
const { getSessionToken } = require('../utils/authCookies');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  const token = bearerToken || getSessionToken(req);
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Attach user info if token is valid
    } catch (err) {
      // BUG-003 fix: silently ignore invalid/expired tokens.
      // This middleware is "optional" — if the token is bad we treat the
      // request as an unauthenticated (guest) request instead of blocking it.
      req.user = null;
    }
  }
  next();
};

module.exports = optionalAuth;
