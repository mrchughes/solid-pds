#!/bin/bash

# Solid PDS Development Setup Script

set -e

echo "🚀 Setting up Solid PDS development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Found version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Environment file created. Please review and update .env as needed."
else
    echo "✅ Environment file already exists"
fi

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data/storage
mkdir -p data/credentials

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    echo "💡 You can run 'npm run docker:build' to build the Docker image"
else
    echo "⚠️  Docker not found. Docker is optional but recommended for containerized deployment."
fi

# Check if Python is available for mock services
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 is available for mock services"
    echo "📦 Installing Python dependencies for mock services..."
    pip3 install flask pyjwt 2>/dev/null || echo "⚠️  Could not install Python dependencies. Mock OIDC service may not work."
else
    echo "⚠️  Python 3 not found. Mock OIDC service may not work."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To run tests:"
echo "  npm test"
echo ""
echo "To start with Docker:"
echo "  npm run docker:build"
echo "  npm run docker:run"
echo ""
echo "To start mock services for testing:"
echo "  npm run start:mocks"
echo ""
echo "📖 API documentation will be available at: http://localhost:3000/api-docs"
echo "🏥 Health check endpoint: http://localhost:3000/health"
echo ""
