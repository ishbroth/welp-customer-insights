#!/bin/bash

# Mobile Build Script for Welp Customer Insights
# Usage: ./scripts/build-mobile.sh [ios|android|both]

set -e

PLATFORM=${1:-both}

echo "🚀 Building Welp Customer Insights mobile app..."
echo "Platform: $PLATFORM"

# Build web application first
echo "🔨 Building web application..."
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync

# Function to build iOS
build_ios() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "❌ iOS builds require macOS. Skipping..."
        return
    fi
    
    echo "🍎 Building iOS app..."
    
    # Check if iOS platform exists
    if [ ! -d "ios" ]; then
        echo "📱 Adding iOS platform..."
        npx cap add ios
        npx cap sync ios
    fi
    
    # Build iOS app
    cd ios/App
    xcodebuild -workspace App.xcworkspace \
               -scheme App \
               -configuration Release \
               -destination generic/platform=iOS \
               -archivePath App.xcarchive \
               archive
    
    echo "✅ iOS build complete! Archive: ios/App/App.xcarchive"
    cd ../..
}

# Function to build Android
build_android() {
    echo "🤖 Building Android app..."
    
    # Check if Android platform exists
    if [ ! -d "android" ]; then
        echo "📱 Adding Android platform..."
        npx cap add android
        npx cap sync android
    fi
    
    # Build Android app
    cd android
    
    # Check if gradlew exists and is executable
    if [ ! -x "./gradlew" ]; then
        chmod +x ./gradlew
    fi
    
    # Build release APK and AAB
    ./gradlew assembleRelease
    ./gradlew bundleRelease
    
    echo "✅ Android build complete!"
    echo "📦 APK: android/app/build/outputs/apk/release/"
    echo "📦 AAB: android/app/build/outputs/bundle/release/"
    cd ..
}

# Build based on platform parameter
case $PLATFORM in
    ios)
        build_ios
        ;;
    android)
        build_android
        ;;
    both)
        build_android
        build_ios
        ;;
    *)
        echo "❌ Invalid platform: $PLATFORM"
        echo "Usage: $0 [ios|android|both]"
        exit 1
        ;;
esac

echo ""
echo "🎉 Build process complete!"
echo ""
echo "Next steps:"
echo "📱 Test builds on devices"
echo "🚀 Deploy to app stores using deployment guide"
echo "📚 See docs/MOBILE_DEPLOYMENT.md for detailed instructions"