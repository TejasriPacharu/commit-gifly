const fs = require("fs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const APP_ID = process.env.APP_ID;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;

function createAppJWT() {
  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH);
  return jwt.sign({ iss: APP_ID }, privateKey, {
    algorithm: "RS256",
    expiresIn: "10m"
  });
}

async function getInstallationToken(installationId) {
  const token = createAppJWT();
  const res = await axios.post(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "gifbot"
      }
    }
  );
  return res.data.token;
}

async function addComment(url, comment, token) {
  await axios.post(
    url,
    { body: comment },
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "gifbot"
      }
    }
  );
}

module.exports = { getInstallationToken, addComment };
