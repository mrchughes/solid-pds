/**
 * Solid PDS Service for PDS 2.0
 * 
 * This service provides a Solid-compliant Personal Data Store
 * for users to store and manage their data securely.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { publishApiSpec } = require('./services/apiRegistryService');

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for demo purposes
const users = new Map();
const organizations = new Map();
const challenges = new Map();

// Helper functions
function generateChallenge() {
    return crypto.randomBytes(32).toString('hex');
}

function verifyClientCredentials(clientId, clientSecret) {
    const organization = organizations.get(clientId);
    return organization && organization.client_secret === clientSecret ? organization : null;
}

async function verifyDIDSignature(did, challenge, signature) {
    // In a real implementation, this would:
    // 1. Resolve the DID document
    // 2. Extract the verification key
    // 3. Verify the signature against the challenge
    // For demo purposes, we'll simulate verification
    console.log(`Verifying DID ${did} signature for challenge ${challenge}`);
    return signature && signature.length > 0; // Simple validation for demo
}

function verifyDIDOwnership(did, proof) {
    // In a real implementation, this would verify cryptographic proof
    // For demo purposes, we'll simulate verification
    console.log(`Verifying ownership of DID ${did}`);
    return proof && proof.length > 0; // Simple validation for demo
}

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

// User DID verification endpoint (PDS 2.1 Requirement #5)
app.post('/users/verify-did', async (req, res) => {
    try {
        const { did, proof } = req.body;

        if (!did || !proof) {
            return res.status(400).json({
                error: 'missing_parameters',
                message: 'DID and proof are required'
            });
        }

        // Verify DID ownership
        const isValid = verifyDIDOwnership(did, proof);
        if (!isValid) {
            return res.status(400).json({
                error: 'invalid_proof',
                message: 'DID ownership proof verification failed'
            });
        }

        // Store or update user DID
        users.set(did, {
            did,
            verified: true,
            verified_at: new Date().toISOString()
        });

        res.json({
            verified: true,
            did,
            message: 'DID successfully verified and registered'
        });
    } catch (error) {
        res.status(500).json({
            error: 'server_error',
            message: 'DID verification failed'
        });
    }
});

// Organization registration endpoint (PDS 2.1 Requirement #3)
app.post('/organizations/register', async (req, res) => {
    try {
        const { name, did, domain, capabilities } = req.body;

        if (!name || !did || !domain) {
            return res.status(400).json({
                error: 'missing_parameters',
                message: 'Name, DID, and domain are required'
            });
        }

        // Generate client credentials
        const client_id = crypto.randomUUID();
        const client_secret = crypto.randomBytes(32).toString('hex');

        // Store organization
        organizations.set(client_id, {
            client_id,
            client_secret,
            name,
            did,
            domain,
            capabilities: capabilities || ['read:credentials'],
            registered_at: new Date().toISOString()
        });

        res.status(201).json({
            client_id,
            client_secret,
            message: 'Organization successfully registered'
        });
    } catch (error) {
        res.status(500).json({
            error: 'server_error',
            message: 'Organization registration failed'
        });
    }
});

// OAuth endpoints for external organization access
app.post('/oauth/token', async (req, res) => {
    try {
        const { client_id, client_secret, grant_type, scope } = req.body;

        if (grant_type !== 'client_credentials') {
            return res.status(400).json({
                error: 'unsupported_grant_type',
                error_description: 'Only client_credentials grant type is supported'
            });
        }

        // Verify client credentials
        const organization = verifyClientCredentials(client_id, client_secret);
        if (!organization) {
            return res.status(401).json({
                error: 'invalid_client',
                error_description: 'Invalid client credentials'
            });
        }

        // Generate access token
        const token = jwt.sign(
            {
                sub: client_id,
                aud: 'https://pds.gov.uk',
                scope: scope || 'read:credentials',
                iss: 'https://pds.gov.uk'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: scope || 'read:credentials'
        });
    } catch (error) {
        res.status(500).json({
            error: 'server_error',
            error_description: 'Internal server error'
        });
    }
});

app.post('/oauth/refresh', async (req, res) => {
    try {
        const { refresh_token, client_id, client_secret } = req.body;

        // Verify client credentials
        const organization = verifyClientCredentials(client_id, client_secret);
        if (!organization) {
            return res.status(401).json({
                error: 'invalid_client',
                error_description: 'Invalid client credentials'
            });
        }

        // In a real implementation, verify the refresh token
        // For now, issue a new access token
        const token = jwt.sign(
            {
                sub: client_id,
                aud: 'https://pds.gov.uk',
                scope: 'read:credentials',
                iss: 'https://pds.gov.uk'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'read:credentials'
        });
    } catch (error) {
        res.status(500).json({
            error: 'server_error',
            error_description: 'Internal server error'
        });
    }
});

// PDS challenge-response endpoint for domain verification (PDS 2.1 Requirement #3)
app.get('/.well-known/did/challenge', async (req, res) => {
    try {
        const challenge = generateChallenge();
        // Store challenge temporarily for verification
        challenges.set(challenge, {
            timestamp: Date.now(),
            domain: req.get('host') || 'pds.gov.uk'
        });

        res.json({
            challenge,
            expires_in: 300 // 5 minutes
        });
    } catch (error) {
        res.status(500).json({
            error: 'server_error',
            message: 'Failed to generate challenge'
        });
    }
});

app.post('/.well-known/did/challenge', async (req, res) => {
    try {
        const { challenge, signature, did } = req.body;

        if (!challenge || !signature || !did) {
            return res.status(400).json({
                error: 'missing_parameters',
                message: 'Challenge, signature, and DID are required'
            });
        }

        // Verify challenge exists and is not expired
        const storedChallenge = challenges.get(challenge);
        if (!storedChallenge || Date.now() - storedChallenge.timestamp > 300000) {
            return res.status(400).json({
                error: 'invalid_challenge',
                message: 'Challenge is invalid or expired'
            });
        }

        // Verify signature against DID document
        const isValid = await verifyDIDSignature(did, challenge, signature);
        if (!isValid) {
            return res.status(400).json({
                error: 'invalid_signature',
                message: 'Signature verification failed'
            });
        }

        // Clean up used challenge
        challenges.delete(challenge);

        res.json({
            verified: true,
            message: 'Domain verification successful'
        });
    } catch (error) {
        res.status(500).json({
            error: 'server_error',
            message: 'Verification failed'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Solid PDS Service listening on port ${port}`);

    // Publish API specification to API Registry
    publishApiSpec().catch(err => {
        console.error('Error publishing API specification:', err.message);
    });
});
