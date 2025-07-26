const jwt = require('jsonwebtoken');
const axios = require('axios');

/**
 * Authentication middleware for Solid OIDC tokens
 * Validates JWT tokens and extracts WebID claims
 */
async function authMiddleware(req, res, next) {
    try {
        // Skip authentication for health checks and API docs
        if (req.path === '/health' || req.path.startsWith('/api-docs')) {
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing or invalid authorization header'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // In production, validate against OIDC provider's JWKS
        // For prototype, we'll do basic JWT validation
        let decoded;

        try {
            if (process.env.MOCK_MODE === 'true') {
                // In mock mode, accept any valid JWT structure
                decoded = jwt.decode(token);
                if (!decoded) {
                    throw new Error('Invalid token format');
                }
            } else {
                // Validate JWT signature (in production, fetch and cache JWKS)
                decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
            }
        } catch (jwtError) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token'
            });
        }

        // Validate required claims
        if (!decoded.webid) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token missing WebID claim'
            });
        }

        // Validate WebID format (should be a valid URI)
        try {
            new URL(decoded.webid);
        } catch (urlError) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid WebID format'
            });
        }

        // Check token expiration
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token has expired'
            });
        }

        // Add user info to request
        req.webid = decoded.webid;
        req.user = {
            webid: decoded.webid,
            sub: decoded.sub,
            iss: decoded.iss,
            aud: decoded.aud
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication processing failed'
        });
    }
}

/**
 * Generate a mock JWT token for testing purposes
 */
function generateMockToken(webid, options = {}) {
    const payload = {
        webid: webid,
        sub: options.sub || 'user-' + Date.now(),
        iss: options.iss || process.env.OIDC_ISSUER || 'https://oidc.solid.gov.uk',
        aud: options.aud || process.env.SERVICE_BASE_URL || 'http://localhost:3000',
        scope: 'openid profile webid',
        exp: Math.floor(Date.now() / 1000) + (options.expiresIn || 3600),
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret');
}

module.exports = {
    authMiddleware,
    generateMockToken
};
