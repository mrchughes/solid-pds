# Test Mocks for Solid PDS

This directory contains mock services and test data to support development and testing of the Solid PDS service.

## Contents

- `tokens/` - Example JWT tokens for testing
- `vcs/` - Sample Verifiable Credentials in both Turtle and JSON-LD formats
- `services/` - Mock implementations of dependent services
- `webids/` - Sample WebID profiles

## Usage

### Running Mock Services

To start all mock services:

```bash
cd test/mocks/services
python mock-solid-idp.py &
node mock-did-ion.js &
```

### Using Test Tokens

Example OIDC token for testing:

```bash
curl -H "Authorization: Bearer $(cat tokens/valid_oidc_token.txt)" \
     http://localhost:3000/profile/card
```

### Test Data

Sample VCs are provided in both formats:
- `vcs/pip_benefit.ttl` - PIP benefit credential in Turtle
- `vcs/pip_benefit.jsonld` - PIP benefit credential in JSON-LD
- `vcs/eon_discount.ttl` - EON discount credential in Turtle
- `vcs/eon_discount.jsonld` - EON discount credential in JSON-LD

## Mock Service Endpoints

### Mock Solid OIDC Provider (Port 8001)
- POST `/token` - Issue test tokens
- GET `/.well-known/jwks.json` - JWKS for token verification
- POST `/register` - Register new users

### Mock DID:ION Service (Port 8002)
- POST `/did/create` - Create test DIDs
- GET `/did/resolve/{did}` - Resolve DID documents
- POST `/did/verify` - Verify signatures

## Environment Variables

Set these in your `.env` file when using mocks:

```bash
MOCK_MODE=true
OIDC_ISSUER=http://localhost:8001
```
