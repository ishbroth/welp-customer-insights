#!/bin/sh

# Xcode Cloud Post-Clone Script
# This script runs after Xcode Cloud clones your repository
# It sets up Node.js, installs dependencies, and builds the web app

set -e

echo "=========================================="
echo "Starting Xcode Cloud Post-Clone Script"
echo "=========================================="

# Navigate to project root
cd ..

echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

# Install Node.js dependencies
echo "Installing npm dependencies..."
npm ci

# Build the web application
echo "Building web application..."
npm run build

# Sync Capacitor
echo "Syncing Capacitor with iOS..."
npx cap sync ios

echo "=========================================="
echo "Post-Clone Script Complete!"
echo "=========================================="
