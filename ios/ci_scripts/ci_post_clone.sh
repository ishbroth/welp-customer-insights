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

# Validate required environment variables
echo "Validating environment variables..."
REQUIRED_VARS="VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY"
MISSING_VARS=""

for VAR in $REQUIRED_VARS; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS="$MISSING_VARS $VAR"
    else
        echo "✓ $VAR is set"
    fi
done

if [ -n "$MISSING_VARS" ]; then
    echo "ERROR: Missing required environment variables:$MISSING_VARS"
    echo ""
    echo "Please add these in App Store Connect:"
    echo "1. Go to App Store Connect"
    echo "2. Select your app → Xcode Cloud"
    echo "3. Edit your workflow → Environment tab"
    echo "4. Add the missing variables"
    exit 1
fi

# Export environment variables for the build process
echo "Exporting environment variables for build..."
export VITE_SUPABASE_URL="${VITE_SUPABASE_URL}"
export VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY}"

# Optional: VITE_STRIPE_PUBLISHABLE_KEY (warn if missing but don't fail)
if [ -z "${VITE_STRIPE_PUBLISHABLE_KEY}" ]; then
    echo "⚠️  Warning: VITE_STRIPE_PUBLISHABLE_KEY is not set"
    echo "   Stripe functionality may not work in this build"
else
    export VITE_STRIPE_PUBLISHABLE_KEY="${VITE_STRIPE_PUBLISHABLE_KEY}"
    echo "✓ VITE_STRIPE_PUBLISHABLE_KEY is set"
fi

# Create .env file for build process (Vite will read this)
echo "Creating .env file for build..."
cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
EOF

echo "✓ Environment configured"

# Install Node.js dependencies
echo "Installing npm dependencies..."
npm ci

# Build the web application
echo "Building web application..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    echo "ERROR: Build failed - dist directory not found!"
    exit 1
fi

echo "✓ Web application built successfully"

# Sync Capacitor
echo "Syncing Capacitor with iOS..."
npx cap sync ios

echo "✓ Capacitor synced"

# Install CocoaPods dependencies
echo "Installing CocoaPods dependencies..."
cd ios/App
pod install

echo "✓ CocoaPods installed"

echo "=========================================="
echo "Post-Clone Script Complete!"
echo "=========================================="
