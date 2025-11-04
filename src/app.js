require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const webhookHandler = require("./webhook");
const { validateEnvironment } = require("./utils");

// Validate environment variables before starting
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.error("Missing required environment variables:", envValidation.missing);
  console.error("Please check your .env file and ensure all required variables are set.");
  process.exit(1);
}

const app = express();

// Middleware to capture raw body for signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));

// Parse JSON for other routes
app.use(bodyparser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'commit-gifly'
  });
});

// Root endpoint with basic info
app.get('/', (req, res) => {
  res.json({
    name: 'Commit Gifly',
    description: 'A GitHub App that responds to comments with animated GIFs',
    version: '1.0.0',
    endpoints: {
      webhook: '/webhook',
      health: '/health'
    }
  });
});

// webhook endpoint
app.post("/webhook", webhookHandler);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404s - use a catch-all route instead of '*'
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
