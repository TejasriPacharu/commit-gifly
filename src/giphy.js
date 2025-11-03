const axios = require("axios");

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

async function searchGif(query) {
  const res = await axios.get("http://api.giphy.com/v1/gifs/search", {
    params: { q: query, api_key: GIPHY_API_KEY, limit: 1 }
  });
  return res.data.data[0]?.images.fixed_height.url;
}

module.exports = { searchGif };
