const { getInstallationToken, addComment } = require("./github");
const { searchGif } = require("./giphy");
const { verifySignature, extractSearchTerm } = require("./utils");

module.exports = async function webhookHandler(req, res) {
  try {
    // Verify webhook signature for security
    const signature = req.get('X-Hub-Signature-256');
    const payload = req.body.toString();
    
    if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET)) {
      console.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse the JSON payload
    const body = JSON.parse(payload);
    
    // Log the webhook event for debugging
    console.log(`📨 Received ${body.action} event for ${body.repository?.full_name}`);

    // Only process comment creation events
    if (body.action !== "created" || !body.comment) {
      console.log(`⏭️  Ignoring ${body.action} event`);
      return res.status(200).json({ message: "Event ignored" });
    }

    // Check if this is a comment on an issue or pull request
    if (!body.issue && !body.pull_request) {
      console.log("⏭️  Not an issue or PR comment, ignoring");
      return res.status(200).json({ message: "Not an issue/PR comment" });
    }

    // Extract search term from comment
    const searchTerm = extractSearchTerm(body.comment.body);
    if (!searchTerm) {
      console.log("⏭️  No gifbot command found in comment");
      return res.status(200).json({ message: "No gifbot command found" });
    }

    console.log(`🔍 Searching for GIF: "${searchTerm}"`);

    // Search for GIF
    const gifUrl = await searchGif(searchTerm);
    if (!gifUrl) {
      console.log(`❌ No GIF found for: "${searchTerm}"`);
      // Still post a comment to let user know we tried
      const token = await getInstallationToken(body.installation.id);
      const issueOrPR = body.issue || body.pull_request;
      await addComment(
        issueOrPR.comments_url, 
        `Sorry, I couldn't find a GIF for "${searchTerm}" 😅`, 
        token
      );
      return res.status(200).json({ message: "No GIF found, but replied to user" });
    }

    // Get installation token and post comment
    const token = await getInstallationToken(body.installation.id);
    const issueOrPR = body.issue || body.pull_request;
    
    const comment = `![${searchTerm} gif](${gifUrl})

*Powered by [Giphy](https://giphy.com) 🎬*`;

    await addComment(issueOrPR.comments_url, comment, token);

    console.log(`✅ Successfully posted GIF for: "${searchTerm}"`);
    res.status(200).json({ 
      message: "GIF posted successfully",
      searchTerm,
      gifUrl 
    });

  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    console.error("Stack trace:", error.stack);
    
    // Don't expose internal errors to GitHub
    res.status(500).json({ error: "Internal server error" });
  }
};
