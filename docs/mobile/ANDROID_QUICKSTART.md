# Android Development Quick Start Guide

## Prerequisites Setup

### Windows Users
1. **Install Node.js** (version 18+): Download from [nodejs.org](https://nodejs.org)
2. **Install Android Studio**: Download from [developer.android.com](https://developer.android.com/studio)
   - During setup, make sure to install Android SDK, Android SDK Platform, and Android Virtual Device
   - Note the Android SDK location (usually `C:\Users\YourName\AppData\Local\Android\Sdk`)
3. **Set Environment Variables**:
   - Open System Properties → Advanced → Environment Variables
   - Add `ANDROID_HOME` = your Android SDK path
   - Add to PATH: `%ANDROID_HOME%\tools`, `%ANDROID_HOME%\platform-tools`

### macOS Users
1. **Install Node.js** (version 18+): Download from [nodejs.org](https://nodejs.org) or use Homebrew: `brew install node`
2. **Install Android Studio**: Download from [developer.android.com](https://developer.android.com/studio)
   - During setup, install Android SDK, Android SDK Platform, and Android Virtual Device
   - Note the Android SDK location (usually `~/Library/Android/sdk`)
3. **Set Environment Variables** (add to `~/.zshrc` or `~/.bash_profile`):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

### Linux Users
1. **Install Node.js** (version 18+): 
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. **Install Android Studio**: Download from [developer.android.com](https://developer.android.com/studio)
   - Extract and run: `./android-studio/bin/studio.sh`
   - During setup, install Android SDK, Android SDK Platform, and Android Virtual Device
3. **Set Environment Variables** (add to `~/.bashrc` or `~/.zshrc`):
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

## Project Setup & First Run

### Step 1: Download and Setup Project
1. **Export to GitHub**: In Lovable, click "Export to GitHub" button
2. **Clone your repository**:
   ```bash
   git clone YOUR_GITHUB_REPO_URL
   cd welp-customer-insights
   ```

### Step 2: Install Dependencies
**From your project root directory** (the folder containing `package.json`):
```bash
npm install
```

### Step 3: Build Web App
```bash
npm run build
```

### Step 4: Add Android Platform (First Time Only)
```bash
npx cap add android
```
⚠️ **Only run this once!** After the first time, use `npx cap sync android` instead.

### Step 5: Sync Changes
```bash
npx cap sync android
```

### Step 6: Launch on Emulator or Device

#### Option A: Auto-launch (Recommended)
```bash
npx cap run android
```

#### Option B: Manual launch via Android Studio
```bash
npx cap open android
```
Then click the green "Run" button in Android Studio.

## Device Setup Options

### Running on Emulator
1. **Create Virtual Device** (if not already done):
   - Open Android Studio
   - Tools → AVD Manager → Create Virtual Device
   - Choose a phone (e.g., Pixel 4) → Next
   - Choose a system image (e.g., API 33) → Next → Finish
2. **Start Emulator**: Click the play button next to your virtual device
3. **Run the app**: Use `npx cap run android`

### Running on Physical Device
1. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer Options will appear in Settings
2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging (ON)
3. **Connect Device**: Use USB cable
4. **Accept Debug Permission**: Allow when prompted on device
5. **Run the app**: Use `npx cap run android`

## Quick Commands Reference

### Daily Development Workflow
```bash
# After making code changes:
npm run build
npx cap sync android
npx cap run android

# Just open Android Studio:
npx cap open android
```

### Troubleshooting Commands
```bash
# Check Capacitor setup:
npx cap doctor

# Clean and rebuild:
npm run build
npx cap sync android --deployment

# Check connected devices:
adb devices
```

## Common Issues & Solutions

### "Command not found" errors
- **Windows**: Restart Command Prompt after setting environment variables
- **macOS/Linux**: Run `source ~/.zshrc` or restart terminal

### "No connected devices" error
- For emulator: Make sure virtual device is running in Android Studio
- For physical device: Enable USB Debugging and accept computer authorization

### "Gradle sync failed"
- Open project in Android Studio: `npx cap open android`
- Let Android Studio sync and download missing components
- Try running from Android Studio first

### "App not updating" after code changes
- Always run: `npm run build` → `npx cap sync android` → `npx cap run android`

## Production Build

When ready to create a release version:
```bash
./scripts/setup-android-signing.sh    # First time only - creates keystore
./scripts/build-android-release.sh    # Creates release AAB file
```

See `android-build.md` for complete Google Play Store deployment guide.

## Next Steps

1. **First run**: Follow this guide to get the app running on emulator/device
2. **Development**: Make code changes, then build → sync → run
3. **Production**: Use the signing and release scripts when ready to publish
4. **Store listing**: Follow `android-build.md` for Google Play Store submission

Need help? Check [Capacitor documentation](https://capacitorjs.com/docs) or the troubleshooting section above.