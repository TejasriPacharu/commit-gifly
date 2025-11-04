const axios = require("axios");

const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC'; // Fallback to public beta key

/**
 * Search for a GIF using Giphy API
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {Promise<string|null>} GIF URL or null if not found
 */
async function searchGif(query, options = {}) {
  if (!query || query.trim().length === 0) {
    console.warn("⚠️  Empty search query provided");
    return null;
  }

  const {
    limit = 10,
    rating = 'pg-13', // Keep it appropriate for work environments
    lang = 'en'
  } = options;

  try {
    console.log(`🔍 Searching Giphy for: "${query}"`);
    
    const response = await axios.get("https://api.giphy.com/v1/gifs/search", {
      params: {
        q: query.trim(),
        api_key: GIPHY_API_KEY,
        limit,
        rating,
        lang
      },
      timeout: 8000 // 8 second timeout
    });

    const gifs = response.data.data;
    
    if (!gifs || gifs.length === 0) {
      console.log(`❌ No GIFs found for: "${query}"`);
      return null;
    }

    // Randomly select from the first few results for variety
    const randomIndex = Math.floor(Math.random() * Math.min(gifs.length, 3));
    const selectedGif = gifs[randomIndex];
    
    // Prefer fixed_height for consistent sizing, fallback to original
    const gifUrl = selectedGif.images.fixed_height?.url || 
                   selectedGif.images.original?.url;

    if (!gifUrl) {
      console.warn(`⚠️  No suitable image found for GIF: ${selectedGif.id}`);
      return null;
    }

    console.log(`✅ Found GIF for "${query}": ${gifUrl}`);
    return gifUrl;

  } catch (error) {
    console.error(`❌ Error searching Giphy for "${query}":`, error.message);
    
    if (error.response) {
      console.error("Giphy API response status:", error.response.status);
      console.error("Giphy API response data:", error.response.data);
      
      // Handle specific Giphy API errors
      if (error.response.status === 401) {
        console.error("❌ Invalid Giphy API key");
      } else if (error.response.status === 429) {
        console.error("❌ Giphy API rate limit exceeded");
      }
    }
    
    return null;
  }
}

/**
 * Search for trending GIFs as a fallback
 * @param {number} limit - Number of GIFs to fetch
 * @returns {Promise<string|null>} Random trending GIF URL or null
 */
async function getTrendingGif(limit = 5) {
  try {
    console.log("🔥 Fetching trending GIFs as fallback");
    
    const response = await axios.get("https://api.giphy.com/v1/gifs/trending", {
      params: {
        api_key: GIPHY_API_KEY,
        limit,
        rating: 'pg-13'
      },
      timeout: 8000
    });

    const gifs = response.data.data;
    
    if (!gifs || gifs.length === 0) {
      return null;
    }

    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    const gifUrl = randomGif.images.fixed_height?.url || 
                   randomGif.images.original?.url;

    console.log(`✅ Found trending GIF: ${gifUrl}`);
    return gifUrl;

  } catch (error) {
    console.error("❌ Error fetching trending GIFs:", error.message);
    return null;
  }
}

module.exports = { 
  searchGif, 
  getTrendingGif 
};
