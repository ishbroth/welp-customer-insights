#!/bin/bash

# Mobile Setup Script for Welp Customer Insights
# This script automates the initial mobile development setup

set -e

echo "🚀 Setting up Welp Customer Insights for mobile development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the web application
echo "🔨 Building web application..."
npm run build

# Check if Capacitor CLI is available
if ! command -v cap &> /dev/null; then
    echo "📱 Installing Capacitor CLI..."
    npm install -g @capacitor/cli
fi

# Detect platform and add accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - Adding iOS platform..."
    npx cap add ios
    echo "🤖 Adding Android platform..."
    npx cap add android
elif [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🤖 Adding Android platform..."
    npx cap add android
    echo "ℹ️  iOS platform requires macOS. Skipping iOS setup."
else
    echo "❓ Unknown platform. Adding Android platform only..."
    npx cap add android
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync

# Create directories for app assets
echo "📁 Creating asset directories..."
mkdir -p assets/app-icons
mkdir -p assets/splash-screens
mkdir -p assets/store-screenshots

# Run Capacitor doctor
echo "🔍 Running Capacitor doctor..."
npx cap doctor

echo ""
echo "✅ Mobile setup complete!"
echo ""
echo "Next steps:"
echo "1. 📱 Test on device: npx cap run ios OR npx cap run android"
echo "2. 🎨 Add app icons to assets/app-icons/"
echo "3. 🖼️  Add splash screens to assets/splash-screens/"
echo "4. 📸 Take store screenshots and add to assets/store-screenshots/"
echo "5. 📚 Read docs/MOBILE_DEPLOYMENT.md for deployment guide"
echo ""
echo "For iOS development:"
echo "- Requires macOS and Xcode"
echo "- Run: npx cap open ios"
echo ""
echo "For Android development:"
echo "- Requires Android Studio"
echo "- Run: npx cap open android"
echo ""
echo "Happy coding! 🎉"