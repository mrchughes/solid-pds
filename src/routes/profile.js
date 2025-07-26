const express = require('express');
const path = require('path');
const storageService = require('../services/storageService');

const router = express.Router();

/**
 * GET /profile/card - Get WebID Profile
 */
router.get('/card', async (req, res) => {
    try {
        const webid = req.webid;
        const profilePath = storageService.getResourcePath(webid, 'profile/card.ttl');

        let profileContent = await storageService.readFile(profilePath);

        if (!profileContent) {
            // Create default profile if it doesn't exist
            await storageService.ensureUserDirectories(webid);

            const url = new URL(webid);
            const profileUri = `${url.protocol}//${url.host}${url.pathname}`;

            profileContent = `@prefix solid: <http://www.w3.org/ns/solid/terms#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix pim: <http://www.w3.org/ns/pim/space#> .
@prefix dc: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#me> a foaf:Person ;
    foaf:name "PDS User" ;
    solid:oidcIssuer <${process.env.OIDC_ISSUER || 'https://oidc.solid.gov.uk'}> ;
    pim:storage <../> ;
    dc:created "${new Date().toISOString()}"^^xsd:dateTime ;
    dc:modified "${new Date().toISOString()}"^^xsd:dateTime .

<../> a pim:Storage .
`;

            await storageService.writeFile(profilePath, profileContent);
        }

        res.set('Content-Type', 'text/turtle');
        res.set('Cache-Control', 'no-cache');
        res.send(profileContent);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve profile'
        });
    }
});

/**
 * PUT /profile/card - Update WebID Profile
 */
router.put('/card', async (req, res) => {
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
        const profilePath = storageService.getResourcePath(webid, 'profile/card.ttl');

        // TODO: Add Turtle validation here
        await storageService.writeFile(profilePath, req.body);

        res.status(200).json({
            message: 'Profile updated successfully',
            webid: webid,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update profile'
        });
    }
});

module.exports = router;
