# Commit Gifly

A GitHub App that listens to issue & PR comments and replies with relevant GIFs from Giphy. Built with Node.js, GitHub Apps API, JWT authentication, and ready for deployment with Docker. A fun way to bring GIF reactions into your GitHub workflows!


## Features

- **GitHub App Integration**: Proper GitHub App with installation-based authentication
- **Secure**: Webhook signature verification and JWT-based authentication
- **Smart GIF Search**: Powered by Giphy API with content filtering
- **Issue & PR Support**: Works on both issues and pull request comments
- **Production Ready**: Comprehensive error handling and logging
- **Docker Support**: Easy deployment with Docker
- **Fast**: Cached JWT tokens and optimized API calls

## Usage

Once your GitHub App is installed on a repository, you can use it by commenting on issues or pull requests:

```
[gifbot:celebration] - Search for celebration GIFs
[gifbot:thumbs up] - Search for thumbs up GIFs
[gifbot:confused] - Search for confused GIFs
[gifbot:coffee] - Search for coffee GIFs
```

The bot will respond with a relevant animated GIF from Giphy!

### Example

**Comment:**
```
This looks great! [gifbot:awesome]
```

**Bot Response:**
![awesome gif](https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif)

*Powered by [Giphy](https://giphy.com) 🎬*
