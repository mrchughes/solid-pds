# PDS 2.0 Implementation Steps

## Architecture Changes

To pivot from our current architecture to the PDS 2.0 model with three organizations (FEP, DRO, and Northern Electric) using DID-based authentication, we need to make the following changes:

### 1. Add Northern Electric Service

- Create a new microservice for Northern Electric
- Implement did:web support for domain verification
- Develop VC issuance (electric bills) and consumption (benefit awards)

### 2. Update Solid PDS

- Implement asynchronous authorization flow
- Add organization registration API with challenge-response
- Develop permission management for user data access
- Update token handling to support DID-based authentication

### 3. Update DRO Service

- Migrate from API key auth to DID-based authentication
- Add did:web document hosting
- Implement challenge-response handling
- Update VC issuance to work with the new flow

### 4. Update FEP Service

- Migrate from API key auth to DID-based authentication
- Add did:web document hosting
- Implement challenge-response handling
- Update benefit award VC issuance
- Add consumption of electric bill VCs

### 5. Update API Registry

- Add organization registry capabilities
- Track registered organizations and their DIDs
- Provide organization discovery APIs

### 6. Update Nginx Configuration

- Add routing for Northern Electric
- Ensure proper handling of `.well-known/did.json` endpoints for all services

## Implementation Plan

### Phase 1: Infrastructure and Shared Components

1. **Update API Registry**
   - Add organization registration and discovery endpoints
   - Implement DID resolution and verification utilities
   - Create organization schema and database models

2. **Update Solid PDS**
   - Implement DID-based authentication 
   - Create asynchronous authorization flow
   - Develop organization registration API

### Phase 2: Service Updates

1. **Update DRO Service**
   - Add did:web document hosting
   - Implement challenge-response mechanism
   - Update VC issuance to use DID-based auth

2. **Update FEP Service**
   - Add did:web document hosting
   - Implement challenge-response mechanism
   - Update to consume electric bill VCs
   - Modify benefit award process

3. **Create Northern Electric Service**
   - Implement did:web document hosting
   - Develop electric bill VC issuance
   - Create benefit award consumption

### Phase 3: Integration and Testing

1. **Update docker-compose.yml**
   - Add Northern Electric service
   - Update environment variables for all services
   - Configure network dependencies

2. **Update Nginx Configuration**
   - Add Northern Electric domain routing
   - Configure all did:web endpoints

3. **End-to-End Testing**
   - Test organization registration flow
   - Verify asynchronous user authorization
   - Test VC issuance and consumption across all services

## Service Isolation Considerations

To ensure services can still be built and tested in isolation:

1. **Shared Libraries**
   - Create a shared library for DID operations and authentication
   - Develop common utilities for challenge-response handling

2. **Mock Services**
   - Implement mock PDS responses for testing
   - Create Docker containers that simulate other services

3. **Service Contracts**
   - Define clear API contracts between services
   - Document required environment variables and configurations

4. **Development Guidelines**
   - Update service implementation guides
   - Provide examples for DID generation and authentication

## Changes to Existing Files

The following key files will need updates:

1. **docker-compose.yml**
   - Add Northern Electric service
   - Update environment variables and dependencies

2. **nginx/conf/default.conf**
   - Add Northern Electric routing
   - Configure did:web endpoints

3. **Service README-IMPLEMENTATION.md**
   - Update documentation to reflect the new authentication flow
   - Add details on DID generation and hosting

4. **Service Dockerfiles**
   - Ensure they include any new dependencies
   - Configure did:web document hosting

## Next Steps

1. Create detailed technical specifications for each service
2. Update service implementation guides
3. Define data models for new entities (organizations, permissions)
4. Create API contracts for all service interactions
