# Xcode Cloud Setup Guide

## Overview

Xcode Cloud is configured to automatically build the Welp iOS app. This document explains the setup and how to configure it in App Store Connect.

## Build Process

The Xcode Cloud build follows these steps:

1. **Post-Clone** (`ios/ci_scripts/ci_post_clone.sh`):
   - Validates environment variables
   - Installs npm dependencies
   - Builds the React web app
   - Syncs Capacitor with iOS

2. **Pre-Xcodebuild** (`ios/ci_scripts/ci_pre_xcodebuild.sh`):
   - Verifies web assets were built successfully
   - Validates the dist directory exists

3. **Xcode Build**:
   - Xcode Cloud builds the iOS app normally
   - Uses the web assets from the dist directory

## Environment Variables Setup

### Required Configuration in App Store Connect

You MUST configure these environment variables in App Store Connect for builds to work:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → Xcode Cloud
3. Edit your workflow → Environment tab
4. Add these variables:

#### Required Variables:
- `VITE_SUPABASE_URL`
  - Value: `https://yftvcixhifvrovwhtgtj.supabase.co`
  - Mark as Secret: Optional (it's a public URL)

- `VITE_SUPABASE_ANON_KEY`
  - Value: (see `.env.xcode-cloud` file)
  - Mark as Secret: ✅ Recommended

#### Optional Variables:
- `VITE_STRIPE_PUBLISHABLE_KEY`
  - Value: (see `.env.xcode-cloud` file)
  - Mark as Secret: ✅ Recommended
  - Note: Build will succeed with warning if missing

### Validation

The build script automatically validates environment variables:

```
✓ VITE_SUPABASE_URL is set
✓ VITE_SUPABASE_ANON_KEY is set
✓ VITE_STRIPE_PUBLISHABLE_KEY is set
```

If any required variables are missing, the build will fail with clear instructions.

## Build Scripts

### ci_post_clone.sh

Location: `ios/ci_scripts/ci_post_clone.sh`

This script:
- Validates required environment variables
- Exports variables for the build process
- Creates a `.env` file for Vite
- Installs npm dependencies with `npm ci`
- Builds the web app with `npm run build`
- Verifies the build output
- Syncs Capacitor with `npx cap sync ios`

### ci_pre_xcodebuild.sh

Location: `ios/ci_scripts/ci_pre_xcodebuild.sh`

This script:
- Verifies the `dist` directory exists
- Ensures web assets are ready for iOS build
- Fails the build if assets are missing

## Troubleshooting

### Build Fails with "Missing required environment variables"

**Solution:**
1. Go to App Store Connect → Xcode Cloud → Edit Workflow
2. Check the Environment tab
3. Verify all required variables are added
4. Ensure variable names match exactly (case-sensitive)

### Build Fails with "dist directory not found"

**Possible causes:**
1. npm dependencies failed to install
2. Web build failed (check for TypeScript/build errors)
3. Environment variables not set correctly

**Solution:**
1. Check Xcode Cloud build logs for npm/build errors
2. Verify environment variables are set
3. Test the build locally: `npm ci && npm run build`

### Web App Not Updating in iOS Build

**Possible causes:**
1. Capacitor sync didn't run
2. Build cache issues

**Solution:**
1. Check build logs for "Syncing Capacitor with iOS"
2. In Xcode Cloud, try "Clean Build Folder" before building
3. Verify `npx cap sync ios` completes successfully in logs

## Local Testing

To test the build scripts locally:

```bash
# Test post-clone script (from project root)
cd ios/ci_scripts
./ci_post_clone.sh

# Test pre-xcodebuild script
./ci_pre_xcodebuild.sh
```

Make sure you have the required environment variables set locally:

```bash
export VITE_SUPABASE_URL="https://yftvcixhifvrovwhtgtj.supabase.co"
export VITE_SUPABASE_ANON_KEY="your_key_here"
export VITE_STRIPE_PUBLISHABLE_KEY="your_key_here"
```

## Files Structure

```
ios/
├── ci_scripts/
│   ├── ci_post_clone.sh       # Post-clone build script
│   └── ci_pre_xcodebuild.sh   # Pre-build verification
└── App/
    └── App.xcodeproj          # Xcode project

.env.xcode-cloud               # Environment variables reference
```

## Best Practices

1. **Always validate locally first**: Test `npm run build` succeeds before pushing
2. **Monitor build logs**: Check Xcode Cloud logs for any warnings
3. **Keep dependencies updated**: Regularly update npm packages
4. **Test environment variables**: Verify all required vars are set in App Store Connect
5. **Don't commit secrets**: Never commit actual `.env` files to git

## Security Notes

- `VITE_SUPABASE_ANON_KEY` is safe to expose (it's the anonymous public key)
- `VITE_STRIPE_PUBLISHABLE_KEY` is safe to expose (it's the publishable key)
- Never commit the actual `.env` file
- Mark sensitive keys as "Secret" in App Store Connect for security
- Backend secrets (STRIPE_SECRET_KEY, RESEND_API_KEY) go in Supabase, not here

## Status

- ✅ Build scripts created and configured
- ✅ Environment variable validation implemented
- ✅ Error handling and logging added
- ✅ Documentation complete
- ⏳ Pending: Environment variables setup in App Store Connect

## Next Steps

1. Go to App Store Connect
2. Configure the environment variables (see above)
3. Trigger a build
4. Monitor the logs
5. Verify the app builds successfully

---

**Created:** October 17, 2025
**Last Updated:** October 17, 2025
**Status:** Ready for App Store Connect configuration
