# Mobile App Deployment Guide

This guide provides step-by-step instructions for deploying the Welp Customer Insights mobile app to both iOS App Store and Google Play Store.

## Prerequisites

### Development Environment Setup
- **Node.js** (v18 or later)
- **Git** for version control
- **GitHub** account with repository access

### For iOS Development
- **macOS** (required for iOS builds)
- **Xcode** (latest stable version)
- **iOS Developer Account** ($99/year)
- **iPhone/iPad** for testing

### For Android Development
- **Android Studio** (any OS)
- **Java Development Kit (JDK) 17**
- **Google Play Console Account** ($25 one-time fee)
- **Android device** for testing

## Initial Setup

### 1. Clone and Setup Project
```bash
git clone https://github.com/ishbroth/welp-customer-insights.git
cd welp-customer-insights
npm install
```

### 2. Build Web Application
```bash
npm run build
```

### 3. Add Mobile Platforms
```bash
# Add iOS platform (macOS only)
npx cap add ios

# Add Android platform
npx cap add android

# Sync changes to native platforms
npx cap sync
```

## iOS Deployment

### 1. Open iOS Project
```bash
npx cap open ios
```

### 2. Configure Signing & Capabilities
- Open project in Xcode
- Select "App" target
- Go to "Signing & Capabilities"
- Select your development team
- Ensure bundle identifier matches: `app.lovable.01e840ab04ff4c6cb5f891237d529da9`

### 3. Update App Information
- Set app version and build number
- Configure app icons and launch screens
- Update app name: "Welp. - Review Customers"

### 4. Build and Archive
- Select "Any iOS Device" as destination
- Product → Archive
- Upload to App Store Connect
- Submit for review

### 5. App Store Connect Setup
- Create app listing
- Add app description, screenshots, keywords
- Set pricing and availability
- Configure App Store review information

## Android Deployment

### 1. Open Android Project
```bash
npx cap open android
```

### 2. Generate Signing Key
```bash
keytool -genkey -v -keystore welp-release-key.keystore -alias welp-key -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Configure Gradle Signing
Edit `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('path/to/welp-release-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'welp-key'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

### 4. Build Release APK/AAB
```bash
cd android
./gradlew assembleRelease  # For APK
./gradlew bundleRelease    # For AAB (recommended)
```

### 5. Google Play Console Setup
- Create app listing
- Upload AAB file
- Complete store listing (description, screenshots, etc.)
- Set pricing and distribution
- Submit for review

## Automated Deployment with GitHub Actions

### 1. Setup Secrets
Add the following secrets to your GitHub repository:

**For iOS:**
- `IOS_CERTIFICATE_BASE64`: Base64 encoded distribution certificate
- `IOS_PROVISIONING_PROFILE_BASE64`: Base64 encoded provisioning profile
- `IOS_CERTIFICATE_PASSWORD`: Certificate password
- `APP_STORE_CONNECT_KEY_ID`: App Store Connect API key ID
- `APP_STORE_CONNECT_ISSUER_ID`: App Store Connect issuer ID
- `APP_STORE_CONNECT_PRIVATE_KEY`: App Store Connect private key

**For Android:**
- `ANDROID_KEYSTORE_BASE64`: Base64 encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_ALIAS`: Key alias
- `ANDROID_KEY_PASSWORD`: Key password
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: Service account JSON

### 2. Trigger Builds
- Push to main branch triggers automatic builds
- Use GitHub Actions manual trigger for specific platform builds
- Tagged releases create production builds

## Testing and Quality Assurance

### 1. Local Testing
```bash
# Run on iOS simulator
npx cap run ios

# Run on Android emulator
npx cap run android
```

### 2. Device Testing
- Test on physical devices before submission
- Verify all features work as expected
- Test performance and user experience

### 3. Beta Testing
- Use TestFlight for iOS beta testing
- Use Google Play Internal Testing for Android
- Gather feedback and iterate

## Troubleshooting

### Common iOS Issues
- **Signing errors**: Verify developer account and certificates
- **Build failures**: Check Xcode version compatibility
- **Upload issues**: Ensure proper bundle identifier and version

### Common Android Issues
- **Gradle build errors**: Check Java version and Android SDK
- **Signing issues**: Verify keystore configuration
- **Upload failures**: Ensure AAB format and proper signing

## Production Maintenance

### 1. Version Updates
- Update version numbers in `capacitor.config.ts`
- Build and test thoroughly
- Submit updates through respective stores

### 2. Monitoring
- Monitor app performance and crash reports
- Track user feedback and reviews
- Update app based on user needs

### 3. Security Updates
- Keep dependencies updated
- Regular security audits
- Follow platform-specific security guidelines

## Support and Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [Lovable Mobile Development Blog](https://lovable.dev/blogs/TODO)

For additional support, consult the project documentation or reach out to the development team.