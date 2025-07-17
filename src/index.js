/**
 * Solid PDS Service for PDS 2.0
 * 
 * This service provides a Solid-compliant Personal Data Store
 * for users to store and manage their data securely.
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'solid-pds' });
});

// Basic routes for demo purposes
app.get('/', (req, res) => {
  res.send('Solid PDS Service');
});

// Start server
app.listen(port, () => {
  console.log(`Solid PDS Service listening on port ${port}`);
});
