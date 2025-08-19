#!/bin/bash

# Build script for Android release
echo "🚀 Building Welp Android App for Production..."

# Set production environment
export NODE_ENV=production

# Build the web app
echo "📦 Building web application..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Build Android release
echo "🤖 Building Android release..."
cd android
./gradlew clean
./gradlew bundleRelease

echo "✅ Android release build complete!"
echo "📁 AAB file location: android/app/build/outputs/bundle/release/app-release.aab"
echo "🎯 Ready for Google Play Console upload!"