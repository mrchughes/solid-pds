# Solid Personal Data Store

## Overview

The Solid PDS (Personal Data Store) service is based on the Community Solid Server and provides a standards-compliant Solid server implementation. It hosts user pods (personal data stores) and WebIDs that serve as the foundation for decentralized identity and data management in the system.

## Key Features

- WebID-based identity provision
- Personal data storage in Solid pods
- Standards-compliant LDP (Linked Data Platform) implementation
- Web Access Control (WAC) for fine-grained permissions
- OAuth 2.0 client registration and token handling
- Integration with Authentication Service for user login

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB
- Docker (for containerized deployment)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start the service: `npm start`

## Development

Start the service in development mode with hot reloading:

```
npm run dev
```

## Architecture

The Solid PDS is built on top of the Community Solid Server with custom extensions for:
- Integration with the Authentication Service
- Support for DID-based verifiable credentials
- Enhanced security features
- Custom plugins for government service requirements

## License

ISC
