#!/bin/bash

# Start mock services for testing

set -e

echo "🧪 Starting mock services for Solid PDS testing..."

# Check if required ports are available
check_port() {
    local port=$1
    local service=$2
    
    if lsof -i :$port >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use. Please stop the service running on port $port first."
        return 1
    fi
    return 0
}

# Check required ports
check_port 8001 "Mock OIDC"
check_port 8002 "Mock DID:ION"

# Start Mock OIDC Provider
echo "🔐 Starting Mock OIDC Provider on port 8001..."
cd test/mocks/services
python3 mock-solid-idp.py &
OIDC_PID=$!
cd ../../..

# Wait a bit for OIDC to start
sleep 2

# Start Mock DID:ION Service  
echo "🆔 Starting Mock DID:ION Service on port 8002..."
cd test/mocks/services
node mock-did-ion.js &
DID_PID=$!
cd ../../..

# Wait for services to start
sleep 3

echo ""
echo "✅ Mock services started successfully!"
echo ""
echo "Mock OIDC Provider: http://localhost:8001"
echo "  - OpenID Configuration: http://localhost:8001/.well-known/openid-configuration"
echo "  - JWKS: http://localhost:8001/.well-known/jwks.json"
echo ""
echo "Mock DID:ION Service: http://localhost:8002"
echo "  - Health check: http://localhost:8002/health"
echo "  - List DIDs: http://localhost:8002/dids"
echo ""
echo "📝 Process IDs:"
echo "  Mock OIDC PID: $OIDC_PID"
echo "  Mock DID:ION PID: $DID_PID"
echo ""
echo "To stop mock services:"
echo "  kill $OIDC_PID $DID_PID"
echo "  or"
echo "  npm run stop:mocks"
echo ""

# Save PIDs for cleanup
echo "$OIDC_PID" > .mock-oidc.pid
echo "$DID_PID" > .mock-did.pid

# Wait for interrupt
trap 'echo ""; echo "🛑 Stopping mock services..."; kill $OIDC_PID $DID_PID 2>/dev/null || true; rm -f .mock-oidc.pid .mock-did.pid; exit 0' INT

echo "💡 Press Ctrl+C to stop all mock services"
wait
