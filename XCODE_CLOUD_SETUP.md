# Xcode Cloud Setup Guide

## Critical Configuration Requirement

⚠️ **IMPORTANT**: When using CocoaPods, Xcode Cloud **MUST** build the workspace file, not the project file directly.

### Problem
If Xcode Cloud is configured to build `App.xcodeproj`, you'll see this error:
```
Unable to open base configuration reference file
'/Volumes/workspace/repository/ios/App/Pods/Target Support Files/Pods-mywelp/Pods-mywelp.release.xcconfig'
```

### Solution

1. Go to **App Store Connect** (https://appstoreconnect.apple.com)
2. Select your app
3. Click **Xcode Cloud** tab
4. Select your workflow and click **Edit Workflow**
5. In the **General** tab, find **"Xcode Project or Workspace"**
6. Change it to: `ios/App/App.xcworkspace`
   - **NOT**: `ios/App/App.xcodeproj`
7. Save the workflow

### Why This Matters

CocoaPods creates a workspace that includes:
- Your app project (`App.xcodeproj`)
- The Pods project (`Pods/Pods.xcodeproj`)

The Pods project contains the xcconfig files (`Pods-mywelp.release.xcconfig`) that your app project references.

When you build the `.xcodeproj` directly, the Pods project isn't included, so the xcconfig references fail.

When you build the `.xcworkspace`, both projects are included and everything works correctly.

## Environment Variables

Make sure these are set in Xcode Cloud workflow settings:

### Required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Optional (but recommended):
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Scheme Configuration

The build uses the `mywelp` scheme, which must be:
- **Shared** (located in `ios/App/App.xcodeproj/xcshareddata/xcschemes/`)
- Configured for the `mywelp` target

## Troubleshooting

### Build fails with "xcconfig not found"
→ Check that Xcode Cloud is building the **workspace**, not the project

### Build fails with "pod install failed"
→ Check the build logs for pod install errors
→ Verify `Podfile.lock` is committed to the repository

### Build succeeds but app won't launch
→ Check environment variables are set correctly
→ Verify `npm run build` completed successfully in the build logs

## Build Process

The Xcode Cloud build follows these steps (defined in `ci_scripts/ci_post_clone.sh`):

1. Validate environment variables
2. Install npm dependencies (`npm ci`)
3. Build the web app (`npm run build`)
4. Sync Capacitor (`npx cap sync ios`)
5. Install CocoaPods dependencies (`pod install`)
6. Verify Pods installation
7. **Xcode Cloud then builds `App.xcworkspace`** ← This must be configured correctly

## Additional Resources

- [CocoaPods Guide](https://guides.cocoapods.org/)
- [Xcode Cloud Documentation](https://developer.apple.com/documentation/xcode/xcode-cloud)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
