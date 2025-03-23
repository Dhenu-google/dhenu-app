/**
 * Main application file for the backend API
 * This connects to Google Cloud SQL and serves data to the React Native app
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const gaushaalaRoutes = require('./gaushaalas');

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/gaushaalas', gaushaalaRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Service is healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; 