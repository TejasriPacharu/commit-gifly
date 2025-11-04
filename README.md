# 🎬 Commit Gifly

A GitHub App that listens to issue & PR comments and replies with relevant GIFs from Giphy. Built with Node.js, GitHub Apps API, JWT authentication, and ready for deployment with Docker. A fun way to bring GIF reactions into your GitHub workflows!


## Features

- **GitHub App Integration**: Proper GitHub App with installation-based authentication
- **Secure**: Webhook signature verification and JWT-based authentication
- **Smart GIF Search**: Powered by Giphy API with content filtering
- **Issue & PR Support**: Works on both issues and pull request comments
- **Production Ready**: Comprehensive error handling and logging
- **Docker Support**: Easy deployment with Docker
- **Fast**: Cached JWT tokens and optimized API calls

## Quick Start

### Prerequisites

- Node.js 16+ 
- A GitHub account
- A Giphy API key (optional - falls back to public beta key)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/commit-gifly.git
cd commit-gifly
npm install
```

### 2. Create a GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in the required information:
   - **App name**: `Your Bot Name`
   - **Homepage URL**: `https://your-domain.com` (or GitHub repo URL)
   - **Webhook URL**: `https://your-domain.com/webhook`
   - **Webhook secret**: Generate a random string
   - **Permissions**:
     - Issues: Read & Write
     - Pull requests: Read & Write
     - Metadata: Read
   - **Subscribe to events**:
     - Issue comments
     - Pull request review comments
4. Create the app and note down the **App ID**
5. Generate and download a **private key**

### 3. Get a Giphy API Key (Optional)

1. Visit [Giphy Developers](https://developers.giphy.com/)
2. Create an account and get your API key
3. The app will work with the public beta key if you don't provide one

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
APP_ID=your_github_app_id
GIPHY_API_KEY=your_giphy_api_key
WEBHOOK_SECRET=your_webhook_secret
PRIVATE_KEY_PATH=./private-key.pem
```

Place your GitHub App's private key file as `private-key.pem` in the project root.

### 5. Run the Application

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on the specified port with these endpoints:
- `GET /` - Basic app information
- `GET /health` - Health check
- `POST /webhook` - GitHub webhook endpoint

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

## Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t commit-gifly .

# Run the container
docker run -d \
  --name commit-gifly \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/private-key.pem:/app/private-key.pem:ro \
  commit-gifly
```

### Docker Compose

```yaml
version: '3.8'
services:
  commit-gifly:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./private-key.pem:/app/private-key.pem:ro
    restart: unless-stopped
```

## Cloud Deployment

### Heroku

1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Add the private key content as `PRIVATE_KEY` environment variable
4. Update `PRIVATE_KEY_PATH` to point to a temporary file location
5. Deploy using Git or GitHub integration

### AWS Lambda

The app can be adapted for AWS Lambda using the Serverless framework. You'll need to:
1. Install `serverless` and `serverless-http`
2. Wrap the Express app with `serverless-http`
3. Configure `serverless.yml` for Lambda deployment

### Railway/Render

Both platforms support Node.js apps with environment variables and file uploads for the private key.

## Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3000` |
| `APP_ID` | Yes | GitHub App ID | - |
| `GIPHY_API_KEY` | No | Giphy API key | Public beta key |
| `WEBHOOK_SECRET` | Yes | GitHub webhook secret | - |
| `PRIVATE_KEY_PATH` | Yes | Path to GitHub App private key | - |

### GitHub App Permissions

Your GitHub App needs these permissions:
- **Issues**: Read & Write (to read and comment on issues)
- **Pull requests**: Read & Write (to read and comment on PRs)
- **Metadata**: Read (to access repository information)

### Webhook Events

Subscribe to these events:
- **Issue comments** (for issue comment reactions)
- **Pull request review comments** (for PR comment reactions)

## Development

### Project Structure

```
src/
├── app.js          # Express server setup
├── webhook.js      # Webhook event handler
├── github.js       # GitHub API integration
├── giphy.js        # Giphy API integration
└── utils.js        # Utility functions
```

### Running Tests

```bash
npm test
```

### Debugging

Enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=commit-gifly:* npm run dev
```
---

