# Microservices Best Practices Guide

This document outlines best practices for ensuring loose coupling and high cohesion in the PDS microservices architecture.

## Principles of Loose Coupling

1. **Service Independence**: Each service must be independently deployable and buildable
2. **API Contracts**: Services interact only through well-defined API contracts
3. **No Shared Databases**: Each service owns its data and exposes it only through APIs
4. **Service Discovery**: Services locate each other through the API Registry
5. **API-First Design**: Design the API contract before implementing the service

## Principles of High Cohesion

1. **Single Responsibility**: Each service has a clear, focused purpose
2. **Business Domain Alignment**: Services are organized around business capabilities
3. **Encapsulated Data**: Each service owns and manages its own data
4. **Independent Scalability**: Services can scale based on their individual needs
5. **Self-Contained**: Each service contains all it needs to fulfill its responsibility

## API Registry Integration

### Publishing Your API

Each service must publish its API specification to the API Registry on startup:

```javascript
const fs = require('fs');
const axios = require('axios');

async function publishApiSpec() {
  try {
    const apiSpec = JSON.parse(fs.readFileSync('./specifications/api-spec.json', 'utf8'));
    await axios.post(process.env.API_REGISTRY_URL + '/specs', {
      serviceName: process.env.SERVICE_NAME,
      version: process.env.SERVICE_VERSION,
      specification: apiSpec,
      description: 'API specification for ' + process.env.SERVICE_NAME
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_REGISTRY_KEY
      }
    });
    console.log(`API specification published for ${process.env.SERVICE_NAME} v${process.env.SERVICE_VERSION}`);
  } catch (error) {
    console.error('Failed to publish API specification:', error.message);
  }
}

// Call this on service startup
publishApiSpec();
```

### Consuming Other Services' APIs

Services should discover and consume other services' APIs through the API Registry:

```javascript
const axios = require('axios');

async function getServiceApiSpec(serviceName) {
  try {
    const response = await axios.get(`${process.env.API_REGISTRY_URL}/specs/${serviceName}/latest`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get API spec for ${serviceName}:`, error.message);
    throw error;
  }
}

async function callServiceAPI(serviceName, endpoint, method = 'GET', data = null) {
  try {
    // Get the service's API specification
    const apiSpec = await getServiceApiSpec(serviceName);
    
    // Extract the base URL from the specification
    const baseUrl = apiSpec.specification.servers[0].url;
    
    // Make the API call
    const response = await axios({
      method,
      url: `${baseUrl}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error calling ${serviceName} API:`, error.message);
    throw error;
  }
}

// Example usage
async function exampleUsage() {
  try {
    // Get a resource from another service
    const resource = await callServiceAPI('other-service', '/resources/123');
    
    // Process the resource...
    
  } catch (error) {
    // Handle error gracefully
    console.error('Failed to get resource:', error.message);
  }
}
```

## did:web Implementation

For services that need to implement did:web directly:

1. **Generate and Store Keys**:
   ```javascript
   const crypto = require('crypto');
   const fs = require('fs');
   
   function generateAndStoreKeys() {
     // Generate Ed25519 keypair
     const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
     
     // Convert to the format you need (e.g., JWK)
     // Store securely
     fs.writeFileSync('./data/keys/public.pem', publicKey.export({ type: 'spki', format: 'pem' }));
     fs.writeFileSync('./data/keys/private.pem', privateKey.export({ type: 'pkcs8', format: 'pem' }));
   }
   ```

2. **Expose DID Document**:
   ```javascript
   app.get('/.well-known/did.json', (req, res) => {
     const publicKey = fs.readFileSync('./data/keys/public.pem');
     // Format as JWK for DID document
     
     res.json({
       "@context": ["https://www.w3.org/ns/did/v1"],
       "id": `did:web:${process.env.SERVICE_DOMAIN || req.hostname}`,
       "verificationMethod": [{
         "id": `did:web:${process.env.SERVICE_DOMAIN || req.hostname}#key-1`,
         "type": "Ed25519VerificationKey2020",
         "controller": `did:web:${process.env.SERVICE_DOMAIN || req.hostname}`,
         "publicKeyJwk": {
           // Your public key in JWK format
         }
       }],
       // Add other DID document properties
     });
   });
   ```

3. **Resolve Other DIDs**:
   ```javascript
   async function resolveDid(did) {
     if (!did.startsWith('did:web:')) {
       throw new Error('Only did:web method is supported');
     }
     
     // Convert did:web:example.com to https://example.com/.well-known/did.json
     const domain = did.replace('did:web:', '');
     const url = `https://${domain}/.well-known/did.json`;
     
     const response = await axios.get(url);
     return response.data;
   }
   ```

## Service Checklist

Ensure each service follows these guidelines:

1. ✓ Publishes API specification to API Registry on startup
2. ✓ Discovers other services through API Registry
3. ✓ Does not hardcode URLs or knowledge of other services' internals
4. ✓ Implements graceful degradation when dependent services are unavailable
5. ✓ For did:web services: Implements the required endpoints and key management
6. ✓ Has comprehensive documentation on how to build and run independently
7. ✓ Includes clear API contracts in OpenAPI format
8. ✓ Has proper error handling and validation
9. ✓ Follows GOV.UK design system for UI components

## Independent Building and Testing

Each service should include:

1. **Clear Build Instructions**:
   ```
   # Build independently
   npm install
   npm run build
   
   # Run tests
   npm test
   
   # Run locally
   npm start
   ```

2. **Dockerfile for Containerization**:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["node", "src/index.js"]
   ```

3. **Environment Configuration Template**:
   ```
   # .env.example
   PORT=3000
   SERVICE_NAME=my-service
   SERVICE_VERSION=1.0.0
   API_REGISTRY_URL=http://api-registry:3005
   API_REGISTRY_KEY=your-api-key-here
   ```

## Example Directory Structure

```
my-service/
├── Dockerfile
├── package.json
├── README.md
├── src/
│   ├── index.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── apiRegistryService.js  # API Registry integration
│   │   └── ...
│   └── utils/
├── specifications/
│   └── api-spec.json  # OpenAPI specification
└── tests/
    ├── unit/
    └── integration/
```

By following these guidelines, each service will maintain high cohesion (focused on its specific purpose) while achieving loose coupling (minimal dependencies on other services).
