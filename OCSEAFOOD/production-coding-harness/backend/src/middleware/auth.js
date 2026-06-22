const { verifyToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Unauthorized: Missing or invalid token',
        status: 401
      }
    });
  }

  const token = authHeader.split(' ')[1];
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
