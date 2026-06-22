const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a new JWT token
 * @param {object} payload - The token payload (e.g. { id, email, role })
 * @returns {string} The signed JWT token
 */
const signToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1d' });
};

/**
 * Verify a JWT token
 * @param {string} token - The signed JWT token
 * @returns {object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken,
};
