const fs = require("fs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const APP_ID = process.env.APP_ID;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;
const PRIVATE_KEY_CONTENT = process.env.PRIVATE_KEY; // For cloud deployment

// Cache for JWT tokens to avoid recreating them frequently
let jwtCache = {
  token: null,
  expiresAt: null
};

/**
 * Get private key from file or environment variable
 * @returns {string} Private key content
 */
function getPrivateKey() {
  // First, try to use private key from environment variable (cloud deployment)
  if (PRIVATE_KEY_CONTENT && PRIVATE_KEY_CONTENT.trim().length > 0) {
    console.log("🔑 Using private key from environment variable");
    // Replace literal \n with actual newlines
    return PRIVATE_KEY_CONTENT.replace(/\\n/g, '\n');
  }
  
  // Fallback to file-based private key (local development)
  if (PRIVATE_KEY_PATH && fs.existsSync(PRIVATE_KEY_PATH)) {
    console.log("🔑 Using private key from file:", PRIVATE_KEY_PATH);
    return fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  }
  
  // If neither is available, throw an error
  throw new Error('Private key not found. Set PRIVATE_KEY environment variable or ensure PRIVATE_KEY_PATH file exists.');
}

/**
 * Create a JWT token for GitHub App authentication
 * @returns {string} JWT token
 */
function createAppJWT() {
  // Return cached token if still valid (with 1 minute buffer)
  const now = Math.floor(Date.now() / 1000);
  if (jwtCache.token && jwtCache.expiresAt && now < (jwtCache.expiresAt - 60)) {
    return jwtCache.token;
  }

  try {
    const privateKey = getPrivateKey();
    const payload = {
      iss: parseInt(APP_ID),
      iat: now,
      exp: now + (10 * 60) // 10 minutes
    };

    const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
    
    // Cache the token
    jwtCache = {
      token,
      expiresAt: payload.exp
    };

    console.log("🔑 JWT token created successfully");
    return token;
  } catch (error) {
    console.error("❌ Error creating JWT:", error.message);
    throw new Error(`Failed to create JWT: ${error.message}`);
  }
}

/**
 * Get an installation access token
 * @param {number} installationId - GitHub installation ID
 * @returns {Promise<string>} Installation access token
 */
async function getInstallationToken(installationId) {
  if (!installationId) {
    throw new Error("Installation ID is required");
  }

  try {
    const appToken = createAppJWT();
    
    const response = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${appToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "commit-gifly/1.0.0"
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log(`🔑 Generated installation token for installation ${installationId}`);
    return response.data.token;
  } catch (error) {
    console.error(`❌ Error getting installation token for ${installationId}:`, error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    throw new Error(`Failed to get installation token: ${error.message}`);
  }
}

/**
 * Add a comment to an issue or pull request
 * @param {string} url - Comments URL from GitHub webhook
 * @param {string} comment - Comment body
 * @param {string} token - Installation access token
 * @returns {Promise<object>} Comment response data
 */
async function addComment(url, comment, token) {
  if (!url || !comment || !token) {
    throw new Error("URL, comment, and token are all required");
  }

  try {
    const response = await axios.post(
      url,
      { body: comment },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "commit-gifly/1.0.0",
          "Content-Type": "application/json"
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log(`💬 Posted comment successfully`);
    return response.data;
  } catch (error) {
    console.error("❌ Error posting comment:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      // Handle specific GitHub API errors
      if (error.response.status === 401) {
        throw new Error("Authentication failed - check your installation token");
      } else if (error.response.status === 403) {
        throw new Error("Forbidden - check your app permissions");
      } else if (error.response.status === 404) {
        throw new Error("Resource not found - check the comments URL");
      }
    }
    
    throw new Error(`Failed to post comment: ${error.message}`);
  }
}

module.exports = { getInstallationToken, addComment };
