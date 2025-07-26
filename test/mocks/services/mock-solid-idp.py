#!/usr/bin/env python3
"""
Mock Solid OIDC Provider for testing the Solid PDS
Provides basic OIDC endpoints and JWT token generation
"""

from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import jwt
import json
import uuid

app = Flask(__name__)

# Mock configuration
SECRET_KEY = "mock-secret-key-for-testing-only"
ISSUER = "https://oidc.solid.gov.uk"
MOCK_USERS = {
    "test.user@example.org": {
        "sub": "user-12345",
        "webid": "https://user.example.org/profile/card#me",
        "name": "Test User",
        "email": "test.user@example.org"
    }
}

@app.route('/.well-known/openid-configuration')
def openid_configuration():
    """OpenID Connect Discovery Document"""
    return jsonify({
        "issuer": ISSUER,
        "authorization_endpoint": f"{ISSUER}/authorize",
        "token_endpoint": f"{ISSUER}/token",
        "userinfo_endpoint": f"{ISSUER}/userinfo",
        "jwks_uri": f"{ISSUER}/.well-known/jwks.json",
        "scopes_supported": ["openid", "profile", "webid"],
        "response_types_supported": ["code", "token"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "subject_types_supported": ["public"],
        "id_token_signing_alg_values_supported": ["HS256"]
    })

@app.route('/.well-known/jwks.json')
def jwks():
    """JSON Web Key Set for token verification"""
    return jsonify({
        "keys": [{
            "kty": "oct",
            "use": "sig",
            "kid": "mock-key-1",
            "alg": "HS256",
            "k": "bW9jay1zZWNyZXQta2V5LWZvci10ZXN0aW5nLW9ubHk"
        }]
    })

@app.route('/token', methods=['POST'])
def token():
    """Token endpoint for issuing access tokens"""
    grant_type = request.form.get('grant_type')
    
    if grant_type == 'authorization_code':
        code = request.form.get('code')
        # In real implementation, validate the authorization code
        
        # Generate tokens
        user = list(MOCK_USERS.values())[0]  # Use first mock user
        access_token = generate_access_token(user)
        id_token = generate_id_token(user)
        
        return jsonify({
            "access_token": access_token,
            "id_token": id_token,
            "token_type": "Bearer",
            "expires_in": 3600,
            "scope": "openid profile webid"
        })
    
    return jsonify({"error": "unsupported_grant_type"}), 400

@app.route('/userinfo')
def userinfo():
    """UserInfo endpoint"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "invalid_token"}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_sub = payload.get('sub')
        
        # Find user by sub
        for user in MOCK_USERS.values():
            if user['sub'] == user_sub:
                return jsonify({
                    "sub": user['sub'],
                    "webid": user['webid'],
                    "name": user['name'],
                    "email": user['email']
                })
        
        return jsonify({"error": "user_not_found"}), 404
    except jwt.InvalidTokenError:
        return jsonify({"error": "invalid_token"}), 401

@app.route('/register', methods=['POST'])
def register():
    """Mock user registration"""
    data = request.get_json()
    user_id = str(uuid.uuid4())
    
    new_user = {
        "sub": f"user-{user_id}",
        "webid": data.get('webid', f"https://user-{user_id}.example.org/profile/card#me"),
        "name": data.get('name', 'New User'),
        "email": data.get('email', f"user-{user_id}@example.org")
    }
    
    MOCK_USERS[new_user['email']] = new_user
    
    return jsonify({
        "sub": new_user['sub'],
        "webid": new_user['webid'],
        "message": "User registered successfully"
    }), 201

def generate_access_token(user):
    """Generate a mock access token"""
    payload = {
        "sub": user['sub'],
        "webid": user['webid'],
        "iss": ISSUER,
        "aud": "http://localhost:3000",
        "scope": "openid profile webid",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def generate_id_token(user):
    """Generate a mock ID token"""
    payload = {
        "sub": user['sub'],
        "webid": user['webid'],
        "name": user['name'],
        "email": user['email'],
        "iss": ISSUER,
        "aud": "solid-pds-client",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

if __name__ == '__main__':
    print("🔐 Starting Mock Solid OIDC Provider on port 8001")
    print("📍 OpenID Configuration: http://localhost:8001/.well-known/openid-configuration")
    print("🔑 JWKS: http://localhost:8001/.well-known/jwks.json")
    app.run(host='0.0.0.0', port=8001, debug=True)
