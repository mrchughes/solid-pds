const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Mock DID storage
const mockDIDs = new Map();

/**
 * Mock DID:ION Service for testing
 * Simulates core DID:ION functionality
 */

// Generate a mock DID:ION document
function generateDIDDocument(publicKey) {
    const did = `did:ion:${crypto.randomBytes(16).toString('hex')}`;

    return {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/jws-2020/v1"
        ],
        "id": did,
        "verificationMethod": [{
            "id": `${did}#primary`,
            "type": "JsonWebKey2020",
            "controller": did,
            "publicKeyJwk": {
                "kty": "RSA",
                "use": "sig",
                "n": publicKey,
                "e": "AQAB"
            }
        }],
        "authentication": [`${did}#primary`],
        "assertionMethod": [`${did}#primary`],
        "service": [{
            "id": `${did}#wallet`,
            "type": "LinkedDomains",
            "serviceEndpoint": "https://wallet.example.org"
        }]
    };
}

// POST /did/create - Create new DID:ION
app.post('/did/create', (req, res) => {
    try {
        const { publicKey } = req.body;

        if (!publicKey) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Public key is required'
            });
        }

        const didDocument = generateDIDDocument(publicKey);
        const did = didDocument.id;

        // Store the DID document
        mockDIDs.set(did, {
            document: didDocument,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            state: 'published'
        });

        console.log(`✅ Created DID: ${did}`);

        res.status(201).json({
            did: did,
            document: didDocument,
            operation: 'create',
            status: 'published'
        });
    } catch (error) {
        console.error('Error creating DID:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create DID'
        });
    }
});

// GET /did/resolve/{did} - Resolve DID document
app.get('/did/resolve/:did', (req, res) => {
    try {
        const did = req.params.did;

        if (!did.startsWith('did:ion:')) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid DID format'
            });
        }

        const didData = mockDIDs.get(did);

        if (!didData) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'DID not found'
            });
        }

        console.log(`🔍 Resolved DID: ${did}`);

        res.status(200).json({
            "@context": "https://w3id.org/did-resolution/v1",
            "didDocument": didData.document,
            "didResolutionMetadata": {
                "contentType": "application/did+ld+json",
                "retrieved": new Date().toISOString()
            },
            "didDocumentMetadata": {
                "created": didData.created,
                "updated": didData.updated,
                "deactivated": false
            }
        });
    } catch (error) {
        console.error('Error resolving DID:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to resolve DID'
        });
    }
});

// POST /did/verify - Verify signature
app.post('/did/verify', (req, res) => {
    try {
        const { did, data, signature } = req.body;

        if (!did || !data || !signature) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'DID, data, and signature are required'
            });
        }

        const didData = mockDIDs.get(did);

        if (!didData) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'DID not found'
            });
        }

        // Mock verification - in real implementation, verify cryptographic signature
        const isValid = signature.length > 10; // Simple mock validation

        console.log(`🔐 Verified signature for DID: ${did}, valid: ${isValid}`);

        res.status(200).json({
            did: did,
            data: data,
            signature: signature,
            verified: isValid,
            verificationMethod: `${did}#primary`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error verifying signature:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify signature'
        });
    }
});

// GET /dids - List all DIDs (for testing)
app.get('/dids', (req, res) => {
    const dids = Array.from(mockDIDs.keys());
    res.status(200).json({
        dids: dids,
        count: dids.length
    });
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'Mock DID:ION Service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        didCount: mockDIDs.size
    });
});

// Create some test DIDs on startup
function initializeTestDIDs() {
    const testDIDs = [
        {
            publicKey: "test-public-key-1",
            note: "Test DID for PIP service"
        },
        {
            publicKey: "test-public-key-2",
            note: "Test DID for EON service"
        }
    ];

    testDIDs.forEach((testDID, index) => {
        const didDocument = generateDIDDocument(testDID.publicKey);
        const did = didDocument.id;

        mockDIDs.set(did, {
            document: didDocument,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            state: 'published',
            note: testDID.note
        });

        console.log(`🧪 Created test DID ${index + 1}: ${did}`);
    });
}

const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
    console.log(`🆔 Mock DID:ION Service running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 List DIDs: http://localhost:${PORT}/dids`);

    // Initialize test data
    initializeTestDIDs();
});
