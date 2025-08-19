# Android Build & Deploy Guide

## Quick Setup for Google Play

### 1. Generate Signing Key
```bash
chmod +x scripts/setup-android-signing.sh
./scripts/setup-android-signing.sh
```

### 2. Configure Signing in android/app/build.gradle
Add this to your `android/app/build.gradle` file:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('signing/welp-release-key.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'welp-key'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Release AAB
```bash
chmod +x scripts/build-android-release.sh
./scripts/build-android-release.sh
```

### 4. Upload to Google Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing app
3. Navigate to Release → Production
4. Upload the AAB file from `android/app/build/outputs/bundle/release/app-release.aab`
5. Complete app listing, screenshots, and store details
6. Submit for review

## App Details for Google Play
- **App Name**: Welp. - Review Customers
- **Package Name**: app.lovable.01e840ab04ff4c6cb5f891237d529da9
- **Category**: Business
- **Target Audience**: Business owners and service providers

## Testing Before Release
```bash
# Test on emulator
npx cap run android

# Test release build
npx cap run android --configuration=release
```

## Troubleshooting
- Ensure Android SDK and build tools are up to date
- Check that Gradle wrapper has execute permissions
- Verify keystore file exists and passwords are correct
- Make sure `ANDROID_HOME` environment variable is set