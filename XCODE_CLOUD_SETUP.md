# Xcode Cloud Setup Guide

## Critical Configuration Requirements

### 1. Workspace Configuration (CRITICAL)

⚠️ **IMPORTANT**: When using CocoaPods, Xcode Cloud **MUST** build the workspace file, not the project file directly.

**Problem:** If Xcode Cloud is configured to build `App.xcodeproj`, you'll see this error:
```
Unable to open base configuration reference file
'/Volumes/workspace/repository/ios/App/Pods/Target Support Files/Pods-mywelp/Pods-mywelp.release.xcconfig'
```

**Solution:**

1. Go to **App Store Connect** (https://appstoreconnect.apple.com)
2. Select your app
3. Click **Xcode Cloud** tab
4. Select your workflow and click **Edit Workflow**
5. In the **General** tab, find **"Xcode Project or Workspace"**
6. Set it to: `ios/App/App.xcworkspace`
   - **NOT**: `ios/App/App.xcodeproj`
7. **VERIFY** the "Start Conditions" section shows:
   - Repository: Your repo
   - Branch: main (or your target branch)
   - **No custom script path overrides**
8. Save the workflow

### 2. Custom Build Scripts Configuration

**Location:** The repository has custom build scripts in `ci_scripts/` at the repository root:
- `ci_scripts/ci_post_clone.sh` - Runs after clone, builds web app and installs CocoaPods
- `ci_scripts/ci_pre_xcodebuild.sh` - Runs before Xcode build, verifies dist folder

**Important:** Xcode Cloud automatically detects and runs scripts in `ci_scripts/` - there should be NO custom configuration needed in App Store Connect for this. If scripts aren't running, check:

1. In App Store Connect → Workflow → General tab:
   - Ensure there's NO custom "Start Conditions" path that overrides script location
   - Scripts should be auto-detected from `ci_scripts/` at repo root

2. Verify in build logs that you see:
   ```
   POST-CLONE SCRIPT IS RUNNING!
   ```
   If you DON'T see this, the script isn't executing (see troubleshooting below)

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

### Build fails with "xcconfig not found" OR "Post-Clone script not found"

**Root Cause:** The custom build script (`ci_post_clone.sh`) isn't running, so:
- npm dependencies aren't installed
- Web app isn't built
- **CocoaPods aren't installed** (causing the xcconfig error)

**Diagnosis Steps:**

1. **Check if script is executing:**
   - Look for `POST-CLONE SCRIPT IS RUNNING!` in build logs
   - If you DON'T see this, the script never ran

2. **Verify App Store Connect Settings:**
   - Go to App Store Connect → Xcode Cloud → Edit Workflow
   - **General tab** → "Xcode Project or Workspace" should be: `ios/App/App.xcworkspace`
   - **Start Conditions** → Should NOT have any custom script paths
   - The workflow should use the default behavior (auto-detect scripts in `ci_scripts/`)

3. **Check repository structure:**
   - Scripts MUST be at: `ci_scripts/ci_post_clone.sh` (repository root)
   - NOT at: `ios/ci_scripts/ci_post_clone.sh`
   - Verify with: `git ls-tree HEAD ci_scripts/`

4. **Verify script permissions:**
   - Scripts must be executable (mode 755)
   - Verify with: `git ls-tree HEAD ci_scripts/ci_post_clone.sh`
   - Should show: `100755 blob ...`

**Solutions:**

- If workspace is set to `App.xcodeproj`: Change to `App.xcworkspace`
- If scripts aren't at repo root: They are (verified in commit 14aa7f2)
- If "Start Conditions" has custom paths: Remove them, use defaults
- If workflow is paused/disabled: Enable it

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
