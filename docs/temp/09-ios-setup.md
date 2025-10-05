# iOS Setup Plan

## Overview
Initialize and configure iOS native project for App Store deployment.

## Current State
- Capacitor configured for iOS
- No `ios/` directory exists
- Cannot build or deploy to iOS
- Cannot submit to App Store

## Work to be Done

### 1. Initialize iOS Project
```bash
npx cap add ios
```
This creates the `ios/` directory with Xcode project.

### 2. Install CocoaPods Dependencies
```bash
cd ios/App
pod install
```

### 3. Configure iOS Project in Xcode
Open `ios/App/App.xcworkspace` and configure:
- **Bundle Identifier**: `com.welp.customerinsights`
- **Team**: Select development team
- **Signing**: Enable automatic signing
- **Deployment Target**: iOS 14.0+
- **Display Name**: "Welp."
- **Version**: 1.0.0
- **Build Number**: 1

### 4. App Icons
Prepare app icons for iOS:
- 1024x1024 App Store icon
- Various sizes for device home screens
- Use Asset Catalog in Xcode
- Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 5. Splash Screen
Configure launch screen:
- Update `ios/App/App/Assets.xcassets/Splash.imageset/`
- Ensure matches Android splash
- Test on different devices

### 6. Info.plist Configuration
Update `ios/App/App/Info.plist`:

```xml
<!-- Camera Permission -->
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to upload photos with reviews</string>

<!-- Photo Library Permission -->
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to upload photos with reviews</string>

<!-- Push Notifications -->
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### 7. Capacitor Plugins Configuration
Verify plugin setup:
- `@capacitor/camera`
- `@capacitor/push-notifications`
- `@capacitor/status-bar`
- `@capacitor/keyboard`
- `@capacitor/share`

### 8. Push Notifications (APNs)
Set up Apple Push Notification service:
- Create APNs certificate in Apple Developer
- Configure in Xcode capabilities
- Add push notification entitlements
- Test with development certificate first

### 9. Build and Test
```bash
# Sync web assets to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build and run on simulator
# Build and run on physical device
```

### 10. Handle iOS-Specific Issues
Address platform differences:
- Safe area insets (notch, home indicator)
- Status bar styling
- Keyboard behavior
- Scroll bounce
- Navigation gestures

### 11. App Store Preparation
Prepare metadata:
- App description
- Keywords
- Screenshots (required sizes)
- Privacy policy URL
- Support URL
- Category selection
- Age rating

### 12. Privacy Manifest
Create Privacy Manifest (required for App Store):
- `PrivacyInfo.xcprivacy`
- Declare data collection
- Declare tracking usage
- Declare required reason APIs

### 13. Build for Release
Configure release build:
- Archive build in Xcode
- Validate archive
- Upload to App Store Connect
- Submit for review

### 14. Continuous Integration
Set up CI/CD for iOS:
- Fastlane configuration
- Automatic build on push
- TestFlight deployment
- App Store deployment

## Files to Create
- `ios/` directory (via `npx cap add ios`)
- `ios/App/App/PrivacyInfo.xcprivacy`
- `fastlane/Fastfile` (for CI/CD)
- `docs/ios-deployment.md` - Deployment guide

## Files to Update
- `capacitor.config.ts` - Ensure iOS config correct
- `package.json` - Add iOS build scripts
- `.gitignore` - Ignore iOS build artifacts

## App Store Requirements Checklist
- [ ] App icons (all required sizes)
- [ ] Launch screen
- [ ] Privacy policy
- [ ] Support URL
- [ ] App description
- [ ] Screenshots (6.5", 5.5" displays)
- [ ] Keywords
- [ ] Age rating
- [ ] Category
- [ ] Privacy manifest
- [ ] Data collection declaration
- [ ] Permissions with descriptions
- [ ] TestFlight testing
- [ ] App Store review submission

## Deliverables
- Working iOS app
- Xcode project configured
- App icons and splash screen
- Permissions configured
- Build for physical devices
- TestFlight ready
- App Store submission ready
