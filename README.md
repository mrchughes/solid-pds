# Solid Personal Data Store (PDS)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-orange)](docs/openapi.yaml)
[![Tests](https://img.shields.io/badge/Tests-Jest-red)](test/)

This repository contains the implementation of the **Solid Personal Data Store (PDS)** service for the PDS3.0 project. It provides a headless, W3C Solid-compliant personal data store for users to securely manage their verifiable credentials with RDF-native storage.

## 🎯 Overview

The Solid PDS is a core component of the PDS3.0 ecosystem that enables:

- **RDF-native storage** in Turtle format with JSON-LD support
- **Solid-compliant Pod** with WebID-based user identification  
- **Verifiable Credentials storage** under `/credentials/` with full lifecycle management
- **Access control** via WAC (Web Access Control) and ACP (Access Control Policies)
- **OIDC authentication** with WebID claim validation
- **Content negotiation** between Turtle and JSON-LD formats
- **RESTful API** with comprehensive OpenAPI 3.0 specification

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OIDC Provider │    │   PIP Service   │    │   EON Service   │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ JWT Tokens           │ VC Storage           │ VC Retrieval
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                         ┌───────▼───────┐
                         │   Solid PDS   │
                         │               │
                         │ • WebID Pods  │
                         │ • VC Storage  │
                         │ • Access Ctrl │
                         │ • RDF Native  │
                         └───────────────┘
```

## 🔧 Key Features

### Core Functionality
- **RDF-native storage** (Turtle preferred) with automatic JSON-LD conversion
- **Solid-compliant Pod** and WebID per user with proper metadata
- **Credential storage** under `/credentials/` with versioning support
- **Access control** via WAC/ACP with fine-grained permissions
- **Headless operation** - no direct UI, API-first design

### Authentication & Security
- **Solid OIDC** token validation with WebID claims
- **Bearer token authentication** for all protected endpoints
- **WebID-based authorization** with proper scope validation
- **Mock mode** for development and testing

### Data Formats & Standards
- **W3C Verifiable Credentials** specification compliance
- **Turtle and JSON-LD** dual format support with content negotiation
- **Linked Data Platform (LDP)** containers for credential discovery
- **Automatic metadata generation** with creation/modification timestamps

## 📁 Project Structure

```
solid-pds/
├── src/                     # Source code
│   ├── index.js            # Main server application
│   ├── middleware/         # Authentication and error handling
│   ├── routes/             # API route handlers
│   └── services/           # Business logic services
├── docs/                   # Documentation and API specs
│   └── openapi.yaml        # Complete OpenAPI 3.0 specification
├── test/                   # Test suite
│   ├── mocks/             # Mock services and test data
│   │   ├── tokens/        # Sample JWT tokens
│   │   ├── vcs/           # Sample Verifiable Credentials
│   │   ├── webids/        # Sample WebID profiles
│   │   └── services/      # Mock OIDC and DID:ION services
│   └── *.test.js          # Jest test files
├── scripts/               # Utility scripts
│   ├── setup.sh          # Development environment setup
│   ├── start-mocks.sh    # Start mock services
│   └── generate-token.sh # Generate test JWT tokens
├── Dockerfile             # Production container
├── docker-compose.yml     # Multi-service setup
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker** (optional, recommended) ([Download](https://www.docker.com/))
- **Python 3** (for mock services) ([Download](https://www.python.org/))

### Quick Setup

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd solid-pds
   npm run setup
   ```

2. **Configure environment:**
   ```bash
   # Edit .env file with your settings
   cp .env.example .env
   nano .env
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Start mock services** (in another terminal):
   ```bash
   npm run start:mocks
   ```

The server will be available at:
- **API Server**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs  
- **Health Check**: http://localhost:3000/health
- **Mock OIDC**: http://localhost:8001
- **Mock DID:ION**: http://localhost:8002

### Docker Deployment

```bash
# Build and run with Docker Compose
npm run docker:compose

# For development with mock services
npm run docker:compose:dev

# Stop all services
npm run docker:down
```

## 📖 API Usage

### Authentication

All endpoints (except `/health` and `/api-docs`) require a valid Solid OIDC Bearer token:

```bash
# Get a test token
npm run generate:token

# Use the token
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/profile/card
```

### WebID Profile Management

```bash
# Get WebID profile
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/profile/card

# Update WebID profile  
curl -X PUT \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: text/turtle" \
     -d '@profile.ttl' \
     http://localhost:3000/profile/card
```

### Verifiable Credentials

```bash
# Store a credential (Turtle format)
curl -X PUT \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: text/turtle" \
     -d '@credential.ttl' \
     http://localhost:3000/credentials/pip-benefit-123

# Store a credential (JSON-LD format)
curl -X PUT \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/ld+json" \
     -d '@credential.jsonld' \
     http://localhost:3000/credentials/eon-discount-456

# Retrieve a credential
curl -H "Authorization: Bearer <token>" \
     -H "Accept: text/turtle" \
     http://localhost:3000/credentials/pip-benefit-123

# List all credentials
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/credentials/index.ttl

# Delete a credential
curl -X DELETE \
     -H "Authorization: Bearer <token>" \
     http://localhost:3000/credentials/pip-benefit-123
```

### Access Control

```bash
# Set access permissions for a credential
curl -X PUT \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: text/turtle" \
     -d '@credential.acl' \
     http://localhost:3000/credentials/pip-benefit-123/.acl

# Get access permissions
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/credentials/pip-benefit-123/.acl
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Verbose output
TEST_VERBOSE=1 npm test
```

### Test with Mock Services

```bash
# Start mock services
npm run start:mocks

# Generate test token
npm run generate:token

# Run integration tests
npm test

# Stop mock services
npm run stop:mocks
```

### Sample Test Data

The project includes comprehensive test data:

- **JWT Tokens**: `test/mocks/tokens/`
- **Verifiable Credentials**: `test/mocks/vcs/`
- **WebID Profiles**: `test/mocks/webids/`
- **Mock Services**: `test/mocks/services/`

## 📋 Environment Configuration

Key environment variables (see `.env.example`):

```bash
# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development

# Storage Configuration  
DATA_ROOT=/app/data
STORAGE_PATH=/app/data/storage

# OIDC Configuration
OIDC_ISSUER=https://oidc.solid.gov.uk
OIDC_JWKS_URI=https://oidc.solid.gov.uk/.well-known/jwks.json

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
TOKEN_EXPIRY=3600

# Mock Configuration (for testing)
MOCK_MODE=false
DEFAULT_WEBID_DOMAIN=http://localhost:3000
```

## 🔍 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests with coverage
npm run test:coverage
```

### Adding New Features

1. **Update OpenAPI specification** in `docs/openapi.yaml`
2. **Implement route handlers** in `src/routes/`
3. **Add business logic** in `src/services/`
4. **Write comprehensive tests** in `test/`
5. **Update documentation** as needed

### Mock Services

The project includes mock services for development:

- **Mock Solid OIDC Provider** (`test/mocks/services/mock-solid-idp.py`)
- **Mock DID:ION Service** (`test/mocks/services/mock-did-ion.js`)

These run independently and provide realistic API responses for testing.

## 📊 Monitoring & Health

### Health Endpoints

- **`GET /health`** - Overall service health
- **`GET /health/ready`** - Readiness probe for Kubernetes
- **`GET /health/live`** - Liveness probe for Kubernetes

### Metrics

The service tracks:
- Request/response times
- Storage operations
- Authentication failures
- Error rates

## 🐳 Production Deployment

### Docker

```bash
# Build production image
docker build -t solid-pds .

# Run with Docker Compose
docker-compose up -d

# Scale horizontally
docker-compose up -d --scale solid-pds=3
```

### Environment Variables

Set these in production:

```bash
NODE_ENV=production
JWT_SECRET=<strong-secret-key>
OIDC_ISSUER=<production-oidc-url>
DATA_ROOT=/app/data
```

## 🔐 Security

### Production Security

- **Change JWT_SECRET** to a strong, randomly generated key
- **Use HTTPS** in production environments
- **Validate OIDC tokens** against production JWKS endpoints
- **Implement rate limiting** for API endpoints
- **Monitor access logs** for suspicious activity

### Development Security

- **Never commit** real credentials or tokens
- **Use mock mode** for local development
- **Rotate test tokens** regularly
- **Review access logs** during development

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Lint your code**: `npm run lint`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Permission errors with scripts:**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

**Mock services not starting:**
```bash
# Check Python dependencies
pip3 install flask pyjwt

# Check Node.js dependencies
npm install
```

**Token validation errors:**
```bash
# Check JWT_SECRET in .env file
# Regenerate test token
npm run generate:token
```

### Support

For issues and questions:
1. **Check the API documentation** at `/api-docs`
2. **Review test examples** in `test/` directory
3. **Check logs** for detailed error messages
4. **Run health checks** to verify service status

---

**Built for PDS3.0 Project** | **W3C Solid Compliant** | **Production Ready**
docker-compose up
```

## API Documentation

See `docs/openapi.yaml` for the full API specification.

### Postman Collection

This service includes a Postman collection (`solid_pds_collection.json`) that documents the API endpoints and provides examples. All API changes must be reflected in this collection.

To use the collection:
1. Import it into Postman
2. Set up your environment variables (`base_url`, `webid`, etc.)
3. Run the collection to test your implementation

Refer to the project's [POSTMAN_GUIDE.md](../POSTMAN_GUIDE.md) for detailed instructions on Postman integration and workflows.

## Testing

```bash
npm test
```

## License

TBD
