const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Import routes
const profileRoutes = require('./routes/profile');
const credentialsRoutes = require('./routes/credentials');
const aclRoutes = require('./routes/acl');
const healthRoutes = require('./routes/health');

// Import middleware
const { authMiddleware } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import services
const storageService = require('./services/storageService');

// Import API documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

class SolidPDSServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.host = process.env.HOST || 'localhost';

        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupSwagger();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"]
                }
            }
        }));

        // CORS configuration
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'WebID'],
            exposedHeaders: ['Location', 'Link']
        }));

        // Logging
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(morgan('combined'));
        }

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.text({ type: 'text/turtle', limit: '10mb' }));
        this.app.use(express.raw({ type: 'application/ld+json', limit: '10mb' }));

        // Custom middleware for content negotiation
        this.app.use((req, res, next) => {
            // Add support for Turtle and JSON-LD content types
            if (req.headers['content-type'] === 'text/turtle') {
                req.body = req.body.toString();
            }
            next();
        });
    }

    setupRoutes() {
        // Health check (no auth required)
        this.app.use('/health', healthRoutes);

        // API documentation (no auth required)
        this.setupSwagger();

        // All other routes require authentication
        this.app.use(authMiddleware);

        // Main API routes
        this.app.use('/profile', profileRoutes);
        this.app.use('/credentials', credentialsRoutes);
        this.app.use('/', aclRoutes); // For /.acl endpoints

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                service: 'Solid Personal Data Store',
                version: process.env.SERVICE_VERSION || '1.0.0',
                status: 'running',
                webid: req.webid,
                timestamp: new Date().toISOString()
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: 'The requested resource was not found',
                path: req.originalUrl
            });
        });
    }

    setupSwagger() {
        try {
            const swaggerPath = path.join(__dirname, '../docs/openapi.yaml');
            if (fs.existsSync(swaggerPath)) {
                const swaggerDocument = YAML.load(swaggerPath);
                this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
                console.log('📚 API documentation available at /api-docs');
            }
        } catch (error) {
            console.warn('⚠️  Could not load API documentation:', error.message);
        }
    }

    setupErrorHandling() {
        this.app.use(errorHandler);
    }

    async initialize() {
        try {
            // Initialize storage service
            await storageService.initialize();
            console.log('📦 Storage service initialized');

            // Ensure required directories exist
            const dataRoot = process.env.DATA_ROOT || './data';
            await fs.ensureDir(dataRoot);
            await fs.ensureDir(path.join(dataRoot, 'storage'));
            await fs.ensureDir(path.join(dataRoot, 'credentials'));
            console.log('📁 Directory structure created');

        } catch (error) {
            console.error('❌ Failed to initialize PDS server:', error);
            throw error;
        }
    }

    async start() {
        try {
            await this.initialize();

            const server = this.app.listen(this.port, this.host, () => {
                console.log(`🚀 Solid PDS Server running on http://${this.host}:${this.port}`);
                console.log(`📖 API documentation: http://${this.host}:${this.port}/api-docs`);
                console.log(`🏥 Health check: http://${this.host}:${this.port}/health`);
                console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            });

            // Graceful shutdown
            process.on('SIGTERM', () => {
                console.log('📤 SIGTERM received, shutting down gracefully');
                server.close(() => {
                    console.log('✅ Server closed');
                    process.exit(0);
                });
            });

            process.on('SIGINT', () => {
                console.log('📤 SIGINT received, shutting down gracefully');
                server.close(() => {
                    console.log('✅ Server closed');
                    process.exit(0);
                });
            });

            return server;
        } catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}

// Start server if this file is run directly
if (require.main === module) {
    const server = new SolidPDSServer();
    server.start();
}

module.exports = SolidPDSServer;
