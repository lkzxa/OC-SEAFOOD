const { verifyToken } = require('../utils/jwt');
const { getSessionToken } = require('../utils/authCookies');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  const token = bearerToken || getSessionToken(req);

  if (!token) {
    return res.status(401).json({
      error: {
        message: 'Unauthorized: Missing or invalid token',
        status: 401
      }
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach payload (id, email, role) to request
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        message: 'Unauthorized: Missing or invalid token',
        status: 401
      }
    });
  }
};

module.exports = auth;
