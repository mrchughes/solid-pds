const express = require('express');

const router = express.Router();

/**
 * GET /health - Health check endpoint
 */
router.get('/', (req, res) => {
    const health = {
        status: 'healthy',
        service: 'Solid Personal Data Store',
        version: process.env.SERVICE_VERSION || '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        checks: {
            storage: true, // TODO: Add actual storage health check
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
            }
        }
    };

    res.status(200).json(health);
});

/**
 * GET /health/ready - Readiness check
 */
router.get('/ready', (req, res) => {
    // Add checks for dependencies (storage, etc.)
    const ready = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
            storage: true // TODO: Add actual readiness checks
        }
    };

    res.status(200).json(ready);
});

/**
 * GET /health/live - Liveness check
 */
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
