# Solid Personal Data Store (PDS)

This repository contains the implementation of the Solid Personal Data Store (PDS) service for the PDS3.0 project.

## Description

The Solid PDS provides a W3C Solid-compliant personal data store for users to securely manage their verifiable credentials. It supports RDF-native storage in Turtle format and provides WebID for user identification.

## Key Features

- RDF-native storage (Turtle preferred)
- Solid-compliant Pod and WebID per user
- Credential storage under /credentials/
- Access control via WAC/ACP

## Project Structure

```
.
├── docs/              # Documentation and OpenAPI specs
├── scripts/           # Utility scripts for setup and deployment
├── src/               # Source code
├── test/              # Tests
│   └── mocks/         # Mock services for testing
├── README.md          # This file
└── SPECIFICATION.md   # Service specification
```

## Getting Started

### Prerequisites

- Node.js (version TBD)
- Docker and Docker Compose

### Installation

1. Clone this repository
2. Run `npm install`
3. Configure the environment variables

### Running the Service

```bash
npm start
```

Or with Docker:

```bash
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
