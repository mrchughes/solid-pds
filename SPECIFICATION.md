# Solid PDS Specification

## Overview

The Solid Personal Data Store (PDS) is a core component of the PDS 2.0 ecosystem, providing a secure, user-controlled storage solution based on Solid standards. It enables users to manage their personal data and grant organizations access to specific resources using fine-grained permissions.

## Microservice Architecture Requirements

As part of the PDS 2.0 ecosystem, the Solid PDS follows these architectural principles:

1. **Loose Coupling**: 
   - Operates as an independent microservice with clear boundaries
   - Communicates with other services only through well-defined APIs
   - Does not share databases or internal data structures with other services
   - Uses the API Registry for service discovery

2. **Complete Implementation**:
   - All endpoints must be fully implemented with no placeholders
   - Error handling must follow the PDS error handling standards
   - All required functionality must be present before deployment

3. **API Publication**:
   - Must publish its OpenAPI specification to the API Registry on startup
   - Must keep its API documentation current and accurate
   - Should version its API appropriately using semantic versioning

4. **GOV.UK Design System Compliance**:
   - All user interfaces must comply with the GOV.UK Design System
   - Must meet WCAG 2.1 AA accessibility standards
   - Must follow GOV.UK content design guidelines
   - Error messages must follow GOV.UK standards

## Service Responsibilities

1. **Data Storage and Management**
   - Store user data in individual pods
   - Support reading, writing, and deleting resources
   - Manage data organization and indexing
   - Support linked data formats (RDF, Turtle, JSON-LD)

2. **Access Control**
   - Implement Web Access Control (WAC) for resource-level permissions
   - Support OAuth 2.0 for delegated access
   - Validate access tokens and verify permissions
   - Enable user-controlled sharing of resources

3. **Organization Integration**
   - Handle organization registration with DID verification
   - Process organization access requests
   - Support asynchronous user authorization
   - Manage organization permissions and access logs

4. **Verifiable Credentials**
   - Store verifiable credentials in user pods
   - Support credential issuance workflows
   - Enable secure credential sharing
   - Maintain credential validity and status

## API Endpoints

### Pod Management

#### Create Pod

- **Endpoint:** `POST /pods`
- **Description:** Create a new pod for a user
- **Authentication:** Admin or system
- **Request Body:**
  ```json
  {
    "owner": "string",  // WebID of the owner
    "podName": "string" // Optional pod name
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "webId": "string",
    "podUrl": "string",
    "created": "string"
  }
  ```

#### Get Pod Info

- **Endpoint:** `GET /pods/:podId`
- **Description:** Get information about a pod
- **Authentication:** Owner or admin
- **Response:**
  ```json
  {
    "id": "string",
    "webId": "string",
    "podUrl": "string",
    "created": "string",
    "storage": {
      "used": "number",
      "limit": "number"
    }
  }
  ```

### Resource Management

#### Create Resource

- **Endpoint:** `POST /:path`
- **Description:** Create a new resource
- **Authentication:** Required
- **Headers:**
  - `Content-Type`: Resource MIME type
- **Request Body:** Resource content
- **Response:** Created resource with appropriate status code

#### Get Resource

- **Endpoint:** `GET /:path`
- **Description:** Retrieve a resource
- **Authentication:** Required (if protected)
- **Response:** Resource content with appropriate headers

#### Update Resource

- **Endpoint:** `PUT /:path`
- **Description:** Update an existing resource
- **Authentication:** Required
- **Headers:**
  - `Content-Type`: Resource MIME type
- **Request Body:** Updated resource content
- **Response:** Updated resource with appropriate status code

#### Delete Resource

- **Endpoint:** `DELETE /:path`
- **Description:** Delete a resource
- **Authentication:** Required
- **Response:** Success status code

### Organization Management

#### Register Organization

- **Endpoint:** `POST /orgs/register`
- **Description:** Register a new organization with DID
- **Request Body:**
  ```json
  {
    "did": "string",
    "name": "string",
    "description": "string",
    "url": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "did": "string",
    "name": "string",
    "challenge": "string",
    "status": "pending"
  }
  ```

#### Verify Organization DID

- **Endpoint:** `POST /orgs/verify`
- **Description:** Verify organization ownership of DID
- **Request Body:**
  ```json
  {
    "did": "string",
    "challenge": "string",
    "signature": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "did": "string",
    "name": "string",
    "status": "verified",
    "verifiedAt": "string"
  }
  ```

#### Request Resource Access

- **Endpoint:** `POST /access/request`
- **Description:** Request access to a user's resource
- **Authentication:** Organization DID
- **Request Body:**
  ```json
  {
    "userWebId": "string",
    "resourcePath": "string",
    "accessMode": "string", // read, write, append
    "purpose": "string",
    "expires": "string" // Optional expiration date
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "status": "pending",
    "expiresAt": "string"
  }
  ```

### User Authorization

#### List Pending Authorization Requests

- **Endpoint:** `GET /auth/requests`
- **Description:** Get pending authorization requests for user
- **Authentication:** User
- **Response:**
  ```json
  [
    {
      "id": "string",
      "organization": {
        "id": "string",
        "name": "string",
        "did": "string"
      },
      "resourcePath": "string",
      "accessMode": "string",
      "purpose": "string",
      "requestedAt": "string",
      "expiresAt": "string"
    }
  ]
  ```

#### Respond to Authorization Request

- **Endpoint:** `POST /auth/requests/:requestId/respond`
- **Description:** Approve or deny an authorization request
- **Authentication:** User
- **Request Body:**
  ```json
  {
    "approved": "boolean",
    "expiresAt": "string" // Optional custom expiration
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "status": "approved|denied",
    "respondedAt": "string"
  }
  ```

## Data Models

### Pod

```json
{
  "id": "string",
  "owner": "string", // WebID
  "created": "string",
  "lastAccessed": "string",
  "storage": {
    "used": "number",
    "limit": "number"
  }
}
```

### Organization

```json
{
  "id": "string",
  "did": "string",
  "name": "string",
  "description": "string",
  "url": "string",
  "status": "pending|verified",
  "verifiedAt": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Access Request

```json
{
  "id": "string",
  "organization": "string", // Org ID
  "user": "string", // WebID
  "resourcePath": "string",
  "accessMode": "string",
  "purpose": "string",
  "status": "pending|approved|denied",
  "requestedAt": "string",
  "respondedAt": "string",
  "expiresAt": "string"
}
```

## Development Approach

### API-First Design

- All endpoints must be designed and documented using OpenAPI 3.0 before implementation
- API specifications must be stored in the `/specifications` directory
- Changes to the API must be documented and versioned appropriately
- API design must follow RESTful principles and standard HTTP methods
- Must follow Solid protocol specifications and standards

### Test-Driven Development

- All functionality must have corresponding unit and integration tests
- Test coverage should meet or exceed 85% for all critical paths
- Mock services should be used to test integration points
- End-to-end tests should verify the complete data flow and user authorization journey
- Security testing must be comprehensive for all data access operations

### Cross-Service Integration

- All interactions with other services must be implemented using the API Registry
- Must integrate with all participating organizations for credential operations
- Services should gracefully handle unavailability of dependent services
- Retry mechanisms should be implemented for transient failures
- Circuit breakers should be used to prevent cascading failures
- Must implement asynchronous authorization workflow for all credential operations

## Integration Points

### API Registry Integration

- Service must register with the API Registry on startup
- Must publish OpenAPI specification to the registry
- Must use the API Registry to discover other services
- Should update the registry when service status changes

### Other Service Dependencies

| Service | Dependency Type | Purpose |
|---------|----------------|---------|
| Auth Service | Authentication | User authentication for accessing the PDS |
| API Registry | Service Discovery | Locating and accessing other services |
| DRO | Organization | Issues debt relief credentials to users |
| FEP | Organization | Issues benefit award credentials to users |
| Northern Electric | Organization | Issues electric bill credentials to users |

## Monitoring and Observability

- Must implement health check endpoint (`/health`)
- Must expose metrics endpoint (`/metrics`) for Prometheus
- Must implement structured logging
- Should include trace IDs in logs for distributed tracing
- Should implement performance monitoring for all data access operations
- Should track metrics on storage usage, credential operations, and authorization requests
- Must implement alerting for security-related events

## Deployment and Scalability

- Service must be containerized using Docker
- Must support horizontal scaling for API components
- Must manage persistent storage for user pods
- Configuration should be environment-based
- Should support zero-downtime deployments
- Must implement backup and recovery procedures for all user data
- Should implement caching for frequently accessed resources

## Dependencies

1. **External Services**
   - MongoDB: Metadata and indexing
   - Redis: Session and cache
   - Auth Service: User authentication
   - API Registry: Service registration

2. **Libraries**
   - @solid/community-server: Solid implementation
   - pds-common: Shared utilities and DID helpers
   - jsonld: JSON-LD processing

## Configuration

The service requires the following environment variables:

```
# Server settings
PORT=3000
NODE_ENV=development

# Database settings
MONGODB_URI=mongodb://mongodb:27017/solid-pds
REDIS_URL=redis://redis:6379

# Authentication settings
AUTH_SERVICE_URL=http://auth-service:3001
OIDC_ISSUER=https://auth.pds.local

# Storage settings
STORAGE_ROOT=/data/pods
MAX_STORAGE_PER_POD=1073741824 # 1GB

# API Registry settings
API_REGISTRY_URL=http://api-registry:3005
API_REGISTRY_KEY=your-api-key
```

## Deployment

The service can be deployed using Docker:

```bash
docker build -t solid-pds .
docker run -p 3000:3000 -v /data/pods:/data/pods --env-file .env solid-pds
```

For local development, the service can be run with:

```bash
npm install
npm run dev
```

## Testing

The service includes unit and integration tests:

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration
```

## Error Handling

All errors follow the standardized error format defined in PDS specifications:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

Common error codes:
- `pod/not-found`: Pod not found
- `resource/not-found`: Resource not found
- `auth/insufficient-permissions`: Insufficient permissions
- `org/verification-failed`: Organization verification failed
- `request/invalid`: Invalid request format

## Security Considerations

1. All data is stored with encryption at rest
2. Access control is enforced at the resource level
3. Authorization follows the principle of least privilege
4. All communications use HTTPS
5. Regular security audits are performed
6. WAC policies are strictly validated
