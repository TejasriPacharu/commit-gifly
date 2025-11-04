const crypto = require('crypto');

/**
 * Verify GitHub webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - GitHub signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} - True if signature is valid
 */
function verifySignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Validate required environment variables
 * @returns {object} - Validation result with missing variables
 */
function validateEnvironment() {
  const required = [
    'PORT',
    'APP_ID',
    'GIPHY_API_KEY',
    'WEBHOOK_SECRET',
    'PRIVATE_KEY_PATH'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Extract search term from comment body
 * @param {string} body - Comment body text
 * @returns {string|null} - Extracted search term or null
 */
function extractSearchTerm(body) {
  const regex = /\[gifbot:(.*?)\]/i;
  const matches = regex.exec(body);
  return matches ? matches[1].trim() : null;
}

module.exports = {
  verifySignature,
  validateEnvironment,
  extractSearchTerm
};