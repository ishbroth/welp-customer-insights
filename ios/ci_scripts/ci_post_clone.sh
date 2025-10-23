#!/bin/sh

# Xcode Cloud Post-Clone Script
# This script runs after Xcode Cloud clones your repository
# It sets up Node.js, installs dependencies, and builds the web app

set -e

echo "=========================================="
echo "Starting Xcode Cloud Post-Clone Script"
echo "=========================================="

# Navigate to project root (script may be run from ios/ directory)
cd "$(dirname "$0")/../.."

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
echo "Checking for Podfile..."
if [ ! -f "ios/App/Podfile" ]; then
    echo "ERROR: Podfile not found at ios/App/Podfile!"
    exit 1
fi
echo "✓ Podfile found"

echo "Checking for Podfile.lock..."
if [ ! -f "ios/App/Podfile.lock" ]; then
    echo "WARNING: Podfile.lock not found - pod install will resolve dependencies from scratch"
else
    echo "✓ Podfile.lock found"
fi

echo "Running pod install..."
cd ios/App
pwd
echo "Contents before pod install:"
ls -la
echo ""
echo "Checking node_modules location (should be at ../../node_modules):"
ls -la ../../node_modules/@capacitor/ || echo "ERROR: node_modules not found at expected location!"
echo ""

if ! pod install --repo-update --verbose; then
    echo "ERROR: pod install failed!"
    echo "Contents of ios/App directory after failed install:"
    ls -la
    exit 1
fi

echo "Contents after pod install:"
ls -la
cd ../..

echo "✓ pod install completed"

# Verify Pods were installed correctly
echo "Verifying Pods installation..."
if [ ! -d "ios/App/Pods" ]; then
    echo "ERROR: Pods directory not found after pod install!"
    echo "Contents of ios/App directory:"
    ls -la ios/App/
    exit 1
fi

echo "✓ Pods directory exists"

if [ ! -d "ios/App/Pods/Target Support Files" ]; then
    echo "ERROR: Pods/Target Support Files directory not found!"
    echo "Contents of Pods directory:"
    ls -la ios/App/Pods/
    exit 1
fi

echo "✓ Target Support Files directory exists"

if [ ! -d "ios/App/Pods/Target Support Files/Pods-mywelp" ]; then
    echo "ERROR: Pods-mywelp directory not found!"
    echo "Contents of Target Support Files:"
    ls -la "ios/App/Pods/Target Support Files/"
    exit 1
fi

echo "✓ Pods-mywelp directory exists"

if [ ! -f "ios/App/Pods/Target Support Files/Pods-mywelp/Pods-mywelp.release.xcconfig" ]; then
    echo "ERROR: Pods-mywelp.release.xcconfig not found!"
    echo "Contents of Pods-mywelp directory:"
    ls -la "ios/App/Pods/Target Support Files/Pods-mywelp/"
    exit 1
fi

echo "✓ Pods-mywelp.release.xcconfig found"

# Show the actual file paths for debugging
echo ""
echo "=== File Path Verification ==="
echo "Working directory: $(pwd)"
echo "Pods directory: $(ls -ld ios/App/Pods/)"
echo "Pods-mywelp.release.xcconfig full path:"
realpath "ios/App/Pods/Target Support Files/Pods-mywelp/Pods-mywelp.release.xcconfig" || echo "ERROR: realpath failed"
echo ""
echo "Workspace file:"
ls -l ios/App/App.xcworkspace/contents.xcworkspacedata
cat ios/App/App.xcworkspace/contents.xcworkspacedata
echo "=== End Path Verification ==="
echo ""

echo "✓ CocoaPods installed and verified successfully"

# Verify workspace exists
echo "Verifying Xcode workspace..."
if [ ! -d "ios/App/App.xcworkspace" ]; then
    echo "ERROR: App.xcworkspace not found!"
    echo "CocoaPods should have created this during 'pod install'"
    exit 1
fi
echo "✓ App.xcworkspace exists"

echo ""
echo "=========================================="
echo "IMPORTANT: Xcode Cloud Configuration"
echo "=========================================="
echo "⚠️  When using CocoaPods, Xcode Cloud MUST build the WORKSPACE, not the PROJECT"
echo ""
echo "In App Store Connect → Xcode Cloud → Edit Workflow:"
echo "  - Set 'Xcode Project or Workspace' to: ios/App/App.xcworkspace"
echo "  - NOT: ios/App/App.xcodeproj"
echo ""
echo "The workspace includes both the app and Pods projects."
echo "Building the .xcodeproj directly will fail with:"
echo "  'Unable to open base configuration reference file Pods-mywelp.release.xcconfig'"
echo "=========================================="
echo ""

echo "=========================================="
echo "Post-Clone Script Complete!"
echo "=========================================="
