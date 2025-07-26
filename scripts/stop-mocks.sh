#!/bin/bash

# Stop mock services

echo "🛑 Stopping mock services..."

# Kill processes using saved PIDs
if [ -f .mock-oidc.pid ]; then
    OIDC_PID=$(cat .mock-oidc.pid)
    if kill -0 "$OIDC_PID" 2>/dev/null; then
        kill "$OIDC_PID"
        echo "✅ Stopped Mock OIDC Provider (PID: $OIDC_PID)"
    fi
    rm -f .mock-oidc.pid
fi

if [ -f .mock-did.pid ]; then
    DID_PID=$(cat .mock-did.pid)
    if kill -0 "$DID_PID" 2>/dev/null; then
        kill "$DID_PID"
        echo "✅ Stopped Mock DID:ION Service (PID: $DID_PID)"
    fi
    rm -f .mock-did.pid
fi

# Also try to kill by port (fallback)
lsof -ti :8001 | xargs kill -9 2>/dev/null || true
lsof -ti :8002 | xargs kill -9 2>/dev/null || true

echo "✅ Mock services stopped"
