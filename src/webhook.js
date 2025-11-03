const { getInstallationToken, addComment } = require("./github");
const { searchGif } = require("./giphy");

const regex = /\[gifbot:(.*?)\]/i;

module.exports = async function webhookHandler(req, res) {
  const body = req.body;

  if (body.action !== "created" || !body.comment) {
    return res.status(200).send("Ignored event");
  }

  const matches = regex.exec(body.comment.body);
  if (!matches) {
    return res.status(200).send("No gifbot command found");
  }

  const searchTerm = matches[1].trim();
  try {
    const gifUrl = await searchGif(searchTerm);
    if (!gifUrl) {
      return res.status(200).send("No GIF found");
    }

    const token = await getInstallationToken(body.installation.id);
    await addComment(body.issue.comments_url, `![gif](${gifUrl})`, token);

    res.status(200).send("Gif posted!");
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Something went wrong");
  }
};
