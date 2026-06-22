const bcrypt = require('bcryptjs');

/**
 * Hash a plaintext password
 * @param {string} password - Plaintext password
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

/**
 * Compare plaintext password with hash
 * @param {string} password - Plaintext password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if match, false otherwise
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
