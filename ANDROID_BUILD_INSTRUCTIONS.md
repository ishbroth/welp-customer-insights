# Android Production Build Instructions

##  Completed Configuration

All Android-specific code changes have been completed! Here's what was done:

### 1. Package ID Updated
- **New Package ID:** `com.mywelp.welp` (matches iOS)
- Updated in: `capacitor.config.ts`, `build.gradle`, `AndroidManifest.xml`, `MainActivity.java`

### 2. Permissions Fixed
- Android 13+ storage permissions configured
- Legacy permissions scoped to Android 12 and below
- All required permissions declared (camera, storage, notifications, network)

### 3. ProGuard Enabled
- Code minification enabled for release builds
- Custom ProGuard rules created for Capacitor WebView bridge
- Optimized APK/AAB size

### 4. App Links Configured
- Deep linking with auto-verification enabled
- Ready for payment return flow (Stripe ’ App)
- Requires assetlinks.json deployment (see step below)

### 5. Notification Channels
- Android 8.0+ notification channel created
- Channel ID: `welp_default`
- Ready for future push notifications

### 6. Payment Disclosures Added
- Mobile-specific payment disclosure in BuyCredits page
- Stripe external checkout clearly indicated
- Google Play policy compliant

### 7. Code Cleanup
- Removed unused RevenueCat IAP service
- All iOS-only code properly isolated

---

## =' REQUIRED: Manual Steps to Complete

### Step 1: Generate Release Keystore

**IMPORTANT:** You must generate a release keystore to sign your app. Keep this file and passwords SECURE - you'll need them for ALL future updates!

#### Option A: Using Command Line (Recommended)

Open Command Prompt or PowerShell and run:

```powershell
cd C:\Users\appli\StudioProjects\welp-customer-insights\android\app

keytool -genkey -v -keystore welp-release.keystore -alias welp-key -keyalg RSA -keysize 2048 -validity 10000
```

When prompted, enter:
- **Keystore password:** `WelpRelease2025!` (or choose your own - remember it!)
- **Key password:** `WelpRelease2025!` (same as keystore password)
- **First and last name:** Your name or company name
- **Organizational unit:** Welp Customer Insights
- **Organization:** MyWelp or your company name
- **City:** Your city
- **State:** Your state
- **Country code:** US (or your country code)

#### Option B: Using Android Studio

1. In Android Studio, go to: **Build ’ Generate Signed Bundle/APK**
2. Select **Android App Bundle**
3. Click **Create new...**  next to Key store path
4. Fill in the form:
   - Key store path: `C:\Users\appli\StudioProjects\welp-customer-insights\android\app\welp-release.keystore`
   - Password: `WelpRelease2025!`
   - Alias: `welp-key`
   - Password: `WelpRelease2025!`
   - Validity: 25 years
5. Fill in certificate information
6. Click OK

**BACKUP YOUR KEYSTORE!** Copy `welp-release.keystore` to a secure location. If you lose this, you cannot update your app on Google Play!

---

### Step 2: Extract SHA-256 Fingerprint

After generating the keystore, get the SHA-256 fingerprint for App Links:

```powershell
cd C:\Users\appli\StudioProjects\welp-customer-insights\android\app

keytool -list -v -keystore welp-release.keystore -alias welp-key
```

Enter password: `WelpRelease2025!`

Look for the **SHA256** fingerprint - it will look like:
```
SHA256: A1:B2:C3:D4:E5:F6:...
```

Copy this fingerprint (remove the colons and spaces).

---

### Step 3: Update assetlinks.json

1. Open: `public/.well-known/assetlinks.json`
2. Replace `PLACEHOLDER_SHA256_FINGERPRINT_WILL_BE_GENERATED_AFTER_KEYSTORE_CREATION` with your actual SHA256 fingerprint (remove colons, uppercase)

Example:
```json
"sha256_cert_fingerprints": [
  "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6"
]
```

3. Deploy this file to: `https://mywelp.com/.well-known/assetlinks.json`
   - Must be accessible publicly
   - Must return `Content-Type: application/json`
   - No authentication required

---

### Step 4: Build Production App

You can now build the signed release AAB for Google Play!

#### Option A: Using Android Studio (Easiest)

1. Open Android Studio
2. Open the project: `C:\Users\appli\StudioProjects\welp-customer-insights\android`
3. Go to: **Build ’ Generate Signed Bundle/APK**
4. Select **Android App Bundle** (AAB)
5. Select existing keystore: `android/app/welp-release.keystore`
6. Enter passwords: `WelpRelease2025!`
7. Select **release** build variant
8. Click **Finish**

The signed AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

#### Option B: Using Gradle Command Line

```powershell
cd C:\Users\appli\StudioProjects\welp-customer-insights\android

.\gradlew bundleRelease
```

---

### Step 5: Test on Physical Device (Optional but Recommended)

Before submitting to Google Play, test on a real Android device:

#### Build Debug APK:
```powershell
cd C:\Users\appli\StudioProjects\welp-customer-insights\android

.\gradlew assembleDebug
```

Debug APK location:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### Install on Device:
1. Enable Developer Options on your Android device (tap Build Number 7 times)
2. Enable USB Debugging
3. Connect device via USB
4. Run: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

#### What to Test:
- [ ] App launches without crashing
- [ ] Splash screen appears and hides correctly
- [ ] Login / authentication works
- [ ] Camera/photo picker works
- [ ] Biometric authentication (if device supports it)
- [ ] **CRITICAL:** Complete payment flow (Stripe checkout ’ external browser ’ return to app)
- [ ] Deep linking works (welpapp:// URLs)
- [ ] Share functionality works
- [ ] Status bar color is correct
- [ ] Haptic feedback works (if device supports it)

---

## =ñ Google Play Submission

### Pre-Submission Checklist:

- [x] Package ID finalized: `com.mywelp.welp`
- [ ] Release keystore generated and backed up
- [ ] assetlinks.json deployed to website
- [ ] Signed AAB built successfully
- [ ] Tested on physical Android device
- [ ] Payment flow tested end-to-end
- [ ] Screenshots captured (phone + tablet)
- [ ] App description prepared
- [ ] Privacy policy URL ready
- [ ] Data safety questionnaire answers prepared

### Data Safety Information (for Google Play Console):

**Data Collected:**
- Email addresses (for account creation and authentication)
- Photos (for review images - user-provided)
- Location (city level only - for business listings)
- User-generated content (reviews, responses)

**Data Shared:**
- Payment information processed by Stripe (not stored in app)
- Review data stored on Supabase servers

**Security Practices:**
- Data encrypted in transit (HTTPS/TLS)
- Data encrypted at rest (Supabase encryption)
- Users can request data deletion (account deletion feature)

**Third-Party Services:**
- Stripe (payment processing)
- Supabase (database and authentication)
- Google Maps (address autocomplete)
- Resend (email delivery)

### Age Rating:
- Recommended: **Teen (13+)**
- Contains user-generated content
- Business-to-consumer interactions
- Content moderation implemented

### App Category:
- Primary: **Business**
- Secondary: **Productivity**

---

## = Important Information to Save

### Keystore Details:
- **Location:** `android/app/welp-release.keystore`
- **Alias:** `welp-key`
- **Password:** `WelpRelease2025!` (or your chosen password)
- **Validity:** 25+ years

  **CRITICAL:** Back up your keystore file! Store it in:
1. Secure cloud storage (Google Drive, Dropbox, etc.)
2. External hard drive
3. Password manager (if it supports file attachments)

Without this keystore, you **cannot** publish updates to your app on Google Play!

### Package Information:
- **Package ID:** com.mywelp.welp
- **Version Code:** 1
- **Version Name:** 1.0
- **Min SDK:** 23 (Android 6.0)
- **Target SDK:** 35 (Android 15)

---

## =€ Build Commands Reference

```powershell
# Navigate to project
cd C:\Users\appli\StudioProjects\welp-customer-insights

# Build web assets (if changed)
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build release AAB (command line)
cd android
.\gradlew bundleRelease

# Build debug APK for testing
.\gradlew assembleDebug

# List connected devices
adb devices

# Install debug APK
adb install app/build/outputs/apk/debug/app-debug.apk

# View logs from device
adb logcat | findstr "com.mywelp.welp"
```

---

## = Troubleshooting

### Build Fails with "keystore not found"
- Make sure you generated the keystore in `android/app/welp-release.keystore`
- Check the path in `build.gradle` is correct

### ProGuard Errors
- Check `proguard-rules.pro` for syntax errors
- Temporarily disable ProGuard (`minifyEnabled false`) to isolate issue

### App Crashes on Launch
- Check logcat for stack traces: `adb logcat`
- Look for JavaScript errors in Chrome DevTools (chrome://inspect)

### Splash Screen Won't Hide
- This is fixed in the code - splash screen should hide automatically after 3 seconds
- If still issues, check `MobileInitializer.tsx` is being rendered

### Payment Flow Doesn't Return to App
- Verify assetlinks.json is deployed and accessible
- Check deep link intent filter in AndroidManifest.xml
- Test with: `adb shell am start -W -a android.intent.action.VIEW -d "welpapp://test"`

### "Package ID already in use" on Play Store
- This shouldn't happen since we're using `com.mywelp.welp`
- If it does, someone already registered this package
- Change to `com.welp.customerinsights` or `com.mywelp.app`

---

## =Þ Next Steps After Build

1. **Test thoroughly** on multiple Android devices
2. **Create Google Play Developer account** ($25 one-time fee)
3. **Prepare store listing:**
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (phone: 16:9 or 9:16, min 320px)
   - Screenshots (7" tablet: recommended)
   - Screenshots (10" tablet: recommended)
   - App description (max 4000 characters)
   - Short description (max 80 characters)

4. **Upload AAB** to Google Play Console
5. **Fill out Data Safety form**
6. **Set up pricing & distribution**
7. **Submit for review**

---

## =Ê Comparison with iOS

| Feature | iOS | Android | Status |
|---------|-----|---------|--------|
| Package ID | com.mywelp.welp | com.mywelp.welp |  Matching |
| Payment Method | External Safari | External Chrome |  Same approach |
| Biometric Auth | Face ID / Touch ID | Face / Fingerprint |  Implemented |
| Camera Access | Native picker | Native picker |  Implemented |
| Haptics | UIImpactFeedback | Vibration API |  Implemented |
| Deep Linking | Universal Links | App Links |  Configured |
| Status Bar | Customized | Customized |  Implemented |
| Splash Screen | Red with logo | Red with logo |  Matching |
| Code Signing | Xcode/Apple | Keystore/Google |  Ready |

---

## ( Summary

Your Welp Android app is **95% ready for production**! The remaining steps are:

1.  **Generate keystore** (5 minutes)
2.  **Extract SHA-256** (2 minutes)
3.  **Update assetlinks.json** (2 minutes)
4.  **Build signed AAB** (5-10 minutes)
5. ø **Test on device** (30-60 minutes recommended)
6. ø **Submit to Google Play** (15-30 minutes)

**Total time to production:** ~1-2 hours

Good luck with your Android launch! =€
