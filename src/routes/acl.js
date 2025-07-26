const express = require('express');
const storageService = require('../services/storageService');

const router = express.Router();

/**
 * PUT /.acl - Set access permissions
 */
router.put('/.acl', async (req, res) => {
    try {
        const webid = req.webid;
        const contentType = req.headers['content-type'];

        if (!contentType || contentType !== 'text/turtle') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Content-Type must be text/turtle'
            });
        }

        if (!req.body || typeof req.body !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid Turtle content'
            });
        }

        await storageService.ensureUserDirectories(webid);

        // Store ACL rules
        const aclPath = storageService.getResourcePath(webid, '.acl');
        await storageService.writeFile(aclPath, req.body);

        res.status(200).json({
            message: 'Access rules updated successfully',
            webid: webid,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating ACL:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update access rules'
        });
    }
});

/**
 * GET /.acl - Get access permissions
 */
router.get('/.acl', async (req, res) => {
    try {
        const webid = req.webid;
        const aclPath = storageService.getResourcePath(webid, '.acl');

        let aclContent = await storageService.readFile(aclPath);

        if (!aclContent) {
            // Create default ACL if it doesn't exist
            await storageService.ensureUserDirectories(webid);

            aclContent = `@prefix acl: <http://www.w3.org/ns/auth/acl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#owner>
    a acl:Authorization ;
    acl:agent <${webid}> ;
    acl:accessTo <./> ;
    acl:default <./> ;
    acl:mode acl:Read, acl:Write, acl:Control .

<#public>
    a acl:Authorization ;
    acl:agentClass foaf:Agent ;
    acl:accessTo <./profile/card> ;
    acl:mode acl:Read .
`;

            await storageService.writeFile(aclPath, aclContent);
        }

        res.set('Content-Type', 'text/turtle');
        res.set('Cache-Control', 'no-cache');
        res.send(aclContent);
    } catch (error) {
        console.error('Error getting ACL:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve access rules'
        });
    }
});

/**
 * PUT /credentials/{vcId}/.acl - Set access permissions for specific credential
 */
router.put('/credentials/:vcId/.acl', async (req, res) => {
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

        if (!contentType || contentType !== 'text/turtle') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Content-Type must be text/turtle'
            });
        }

        if (!req.body || typeof req.body !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid Turtle content'
            });
        }

        await storageService.ensureUserDirectories(webid);

        // Store credential-specific ACL rules
        const aclPath = storageService.getResourcePath(webid, `credentials/${vcId}.acl`);
        await storageService.writeFile(aclPath, req.body);

        res.status(200).json({
            message: 'Credential access rules updated successfully',
            vcId: vcId,
            webid: webid,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating credential ACL:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update credential access rules'
        });
    }
});

/**
 * GET /credentials/{vcId}/.acl - Get access permissions for specific credential
 */
router.get('/credentials/:vcId/.acl', async (req, res) => {
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

        const aclPath = storageService.getResourcePath(webid, `credentials/${vcId}.acl`);

        let aclContent = await storageService.readFile(aclPath);

        if (!aclContent) {
            // Create default credential ACL if it doesn't exist
            aclContent = `@prefix acl: <http://www.w3.org/ns/auth/acl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#owner>
    a acl:Authorization ;
    acl:agent <${webid}> ;
    acl:accessTo <${vcId}.ttl>, <${vcId}.jsonld> ;
    acl:mode acl:Read, acl:Write, acl:Control .

<#private>
    a acl:Authorization ;
    acl:agent <${webid}> ;
    acl:accessTo <${vcId}.ttl>, <${vcId}.jsonld> ;
    acl:mode acl:Read .
`;

            await storageService.writeFile(aclPath, aclContent);
        }

        res.set('Content-Type', 'text/turtle');
        res.set('Cache-Control', 'no-cache');
        res.send(aclContent);
    } catch (error) {
        console.error('Error getting credential ACL:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve credential access rules'
        });
    }
});

module.exports = router;
