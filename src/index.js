/**
 * Solid PDS Service for PDS 2.0
 * 
 * This service provides a Solid-compliant Personal Data Store
 * for users to store and manage their data securely.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { publishApiSpec } = require('./services/apiRegistryService');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'solid-pds',
        version: process.env.SERVICE_VERSION || '1.0.0'
    });
});

// Basic routes for demo purposes
app.get('/', (req, res) => {
    res.send('Solid PDS Service');
});

// Start server
app.listen(port, () => {
    console.log(`Solid PDS Service listening on port ${port}`);

    // Publish API specification to API Registry
    publishApiSpec().catch(err => {
        console.error('Error publishing API specification:', err.message);
    });
});
