#!/bin/sh

# Xcode Cloud Pre-Xcodebuild Script
# This script runs just before Xcode starts building

set -e

echo "=========================================="
echo "Pre-Xcodebuild Script"
echo "=========================================="

echo "Initial directory: $(pwd)"

# Navigate to repository root (script is in ios/App/ci_scripts/)
cd "$(dirname "$0")/../../.."

echo "After navigation: $(pwd)"

# Verify that web assets were built
if [ ! -d "dist" ]; then
    echo "ERROR: dist directory not found!"
    echo "Web build may have failed."
    exit 1
fi

echo "✓ Web assets found in dist/"
echo "✓ Ready for Xcode build"

echo "=========================================="
echo "Pre-Xcodebuild Script Complete!"
echo "=========================================="
