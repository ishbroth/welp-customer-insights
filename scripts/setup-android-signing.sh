#!/bin/bash

# Android Signing Setup Script
echo "🔐 Setting up Android signing for Welp..."

# Create keystore directory
mkdir -p android/app/signing

echo "📝 Generating release keystore..."
echo "You'll be prompted for keystore details. Use these recommendations:"
echo "- Password: Use a strong password and save it securely"
echo "- First and Last Name: Your business name or your name"
echo "- Organizational Unit: IT Department (or similar)"
echo "- Organization: Your company name"
echo "- City/Locality: Your city"
echo "- State/Province: Your state"
echo "- Country Code: Your 2-letter country code (e.g., US)"
echo ""

# Generate the keystore
keytool -genkey -v -keystore android/app/signing/welp-release-key.keystore -alias welp-key -keyalg RSA -keysize 2048 -validity 10000

echo ""
echo "✅ Keystore generated successfully!"
echo "⚠️  IMPORTANT: Save your keystore and passwords securely!"
echo "📁 Keystore location: android/app/signing/welp-release-key.keystore"
echo ""
echo "Next steps:"
echo "1. Update android/app/build.gradle with signing configuration"
echo "2. Add keystore passwords to your secure storage"
echo "3. Never commit the keystore to version control!"