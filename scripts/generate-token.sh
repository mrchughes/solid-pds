#!/bin/bash

# Generate test JWT tokens for development

set -e

echo "🔑 Generating test tokens for Solid PDS..."

# Default values
WEBID="https://user.example.org/profile/card#me"
ISSUER="https://oidc.solid.gov.uk"
AUDIENCE="http://localhost:3000"
EXPIRY=3600

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --webid)
            WEBID="$2"
            shift 2
            ;;
        --issuer)
            ISSUER="$2"
            shift 2
            ;;
        --audience)
            AUDIENCE="$2"
            shift 2
            ;;
        --expiry)
            EXPIRY="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --webid <uri>      WebID URI (default: https://user.example.org/profile/card#me)"
            echo "  --issuer <uri>     Token issuer (default: https://oidc.solid.gov.uk)"
            echo "  --audience <uri>   Token audience (default: http://localhost:3000)"
            echo "  --expiry <seconds> Token expiry in seconds (default: 3600)"
            echo "  --help             Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Generate token using Node.js
node -e "
const jwt = require('jsonwebtoken');
const fs = require('fs');

const payload = {
  webid: '$WEBID',
  sub: 'user-' + Date.now(),
  iss: '$ISSUER',
  aud: '$AUDIENCE',
  scope: 'openid profile webid',
  exp: Math.floor(Date.now() / 1000) + $EXPIRY,
  iat: Math.floor(Date.now() / 1000)
};

const secret = process.env.JWT_SECRET || 'default-secret';
const token = jwt.sign(payload, secret);

console.log('Generated JWT token:');
console.log(token);
console.log('');
console.log('Payload:');
console.log(JSON.stringify(payload, null, 2));
console.log('');
console.log('To use this token with curl:');
console.log('curl -H \"Authorization: Bearer ' + token + '\" http://localhost:3000/profile/card');
console.log('');

// Save to file
fs.writeFileSync('test-token.txt', token);
console.log('Token saved to test-token.txt');
"

echo ""
echo "✅ Test token generated successfully!"
