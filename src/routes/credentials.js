const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const storageService = require('../services/storageService');

const router = express.Router();

/**
 * GET /credentials/index.ttl - Get index of all credentials
 */
router.get('/index.ttl', async (req, res) => {
    try {
        const webid = req.webid;
        await storageService.ensureUserDirectories(webid);

        // Update and return the credentials index
        const indexPath = await storageService.updateCredentialsIndex(webid);
        const indexContent = await storageService.readFile(indexPath);

        res.set('Content-Type', 'text/turtle');
        res.set('Cache-Control', 'no-cache');
        res.send(indexContent);
    } catch (error) {
        console.error('Error getting credentials index:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve credentials index'
        });
    }
});

/**
 * GET /credentials/{vcId} - Read credential
 */
router.get('/:vcId', async (req, res) => {
    try {
        const webid = req.webid;
        const vcId = req.params.vcId;

        // Security: Validate vcId to prevent path traversal
        if (!/^[a-zA-Z0-9_-]+$/.test(vcId) || vcId.includes('..') || vcId.includes('/')) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid credential ID format'
            });
        } const accept = req.headers.accept || 'text/turtle';
        let filePath;
        let contentType;

        // Determine file format based on Accept header
        if (accept.includes('application/ld+json')) {
            filePath = storageService.getResourcePath(webid, `credentials/${vcId}.jsonld`);
            contentType = 'application/ld+json';
        } else {
            filePath = storageService.getResourcePath(webid, `credentials/${vcId}.ttl`);
            contentType = 'text/turtle';
        }

        const content = await storageService.readFile(filePath);

        if (!content) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Credential not found',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        } res.set('Content-Type', contentType);
        res.set('Cache-Control', 'no-cache');
        res.send(content);
    } catch (error) {
        console.error('Error reading credential:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to read credential'
        });
    }
});

/**
 * PUT /credentials/{vcId} - Write credential
 */
router.put('/:vcId', async (req, res) => {
    try {
        const webid = req.webid;
        const vcId = req.params.vcId;
        const contentType = req.headers['content-type'];

        // Security: Validate vcId to prevent path traversal
        if (!/^[a-zA-Z0-9_-]+$/.test(vcId)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid credential ID format'
            });
        }

        if (!contentType || (!contentType.includes('text/turtle') && !contentType.includes('application/ld+json'))) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Content-Type must be text/turtle or application/ld+json'
            });
        }

        if (!req.body) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing request body'
            });
        }

        await storageService.ensureUserDirectories(webid);

        let content = req.body;
        let fileExtension;

        // Handle different content types
        if (contentType.includes('application/ld+json')) {
            fileExtension = 'jsonld';
            // Parse and validate JSON-LD
            try {
                if (typeof content === 'string') {
                    content = JSON.parse(content);
                }
                content = JSON.stringify(content, null, 2);
            } catch (parseError) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid JSON-LD format'
                });
            }
        } else {
            fileExtension = 'ttl';
            if (typeof content !== 'string') {
                content = content.toString();
            }
        }

        // Store the credential
        const filePath = storageService.getResourcePath(webid, `credentials/${vcId}.${fileExtension}`);
        await storageService.writeFile(filePath, content);

        // Add metadata
        const metadataContent = storageService.generateResourceMetadata(
            webid,
            `urn:uuid:${vcId}`,
            contentType,
            `Verifiable Credential ${vcId}`
        );
        const metadataPath = storageService.getResourcePath(webid, `credentials/${vcId}.meta.ttl`);
        await storageService.writeFile(metadataPath, metadataContent);

        // Update credentials index
        await storageService.updateCredentialsIndex(webid);

        res.status(201).json({
            message: 'Credential stored successfully',
            id: vcId,
            contentType: contentType,
            location: `/credentials/${vcId}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error storing credential:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to store credential'
        });
    }
});

/**
 * DELETE /credentials/{vcId} - Delete credential
 */
router.delete('/:vcId', async (req, res) => {
    try {
        const webid = req.webid;
        const vcId = req.params.vcId;

        // Security: Validate vcId to prevent path traversal
        if (!/^[a-zA-Z0-9_-]+$/.test(vcId)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid credential ID format'
            });
        }

        // Delete both Turtle and JSON-LD versions if they exist
        const turtlePath = storageService.getResourcePath(webid, `credentials/${vcId}.ttl`);
        const jsonLdPath = storageService.getResourcePath(webid, `credentials/${vcId}.jsonld`);
        const metadataPath = storageService.getResourcePath(webid, `credentials/${vcId}.meta.ttl`);

        let deleted = false;

        if (await storageService.deleteFile(turtlePath)) {
            deleted = true;
        }
        if (await storageService.deleteFile(jsonLdPath)) {
            deleted = true;
        }
        if (await storageService.deleteFile(metadataPath)) {
            // Metadata deletion doesn't count as primary deletion
        }

        if (!deleted) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Credential not found'
            });
        }

        // Update credentials index
        await storageService.updateCredentialsIndex(webid);

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting credential:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete credential'
        });
    }
});

module.exports = router;
