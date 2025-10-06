#!/bin/bash
set -e

echo "🗑️  Step 1: Deleting corrupted iOS directory..."
rm -rf ios

echo "📱 Step 2: Creating fresh iOS platform..."
npx cap add ios

echo "🔧 Step 3: Creating mywelp scheme..."
# Create xcshareddata/xcschemes directory if it doesn't exist
mkdir -p ios/App/App.xcodeproj/xcshareddata/xcschemes

# Create mywelp.xcscheme
cat > ios/App/App.xcodeproj/xcshareddata/xcschemes/mywelp.xcscheme << 'SCHEME_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1500"
   version = "1.7">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry
            buildForTesting = "YES"
            buildForRunning = "YES"
            buildForProfiling = "YES"
            buildForArchiving = "YES"
            buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
               BuildableName = "mywelp.app"
               BlueprintName = "mywelp"
               ReferencedContainer = "container:App.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      shouldUseLaunchSchemeArgsEnv = "YES">
      <Testables>
      </Testables>
   </TestAction>
   <LaunchAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      launchStyle = "0"
      useCustomWorkingDirectory = "NO"
      ignoresPersistentStateOnLaunch = "NO"
      debugDocumentVersioning = "YES"
      debugServiceExtension = "internal"
      allowLocationSimulation = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
            BuildableName = "mywelp.app"
            BlueprintName = "mywelp"
            ReferencedContainer = "container:App.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction
      buildConfiguration = "Release"
      shouldUseLaunchSchemeArgsEnv = "YES"
      savedToolIdentifier = ""
      useCustomWorkingDirectory = "NO"
      debugDocumentVersioning = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
            BuildableName = "mywelp.app"
            BlueprintName = "mywelp"
            ReferencedContainer = "container:App.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction
      buildConfiguration = "Debug">
   </AnalyzeAction>
   <ArchiveAction
      buildConfiguration = "Release"
      revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>
SCHEME_EOF

echo "📝 Step 4: Scheme created successfully"

echo "📝 Step 5: Updating Xcode project target name..."
# Update project.pbxproj target name
sed -i '' 's/\/\* App \*\/ = {/\/* mywelp *\/ = {/g' ios/App/App.xcodeproj/project.pbxproj
sed -i '' 's/name = App;/name = mywelp;/g' ios/App/App.xcodeproj/project.pbxproj
sed -i '' 's/\/\* App.app \*\//\/* mywelp.app *\//g' ios/App/App.xcodeproj/project.pbxproj
sed -i '' 's/"Build configuration list for PBXNativeTarget \\"App\\""/"Build configuration list for PBXNativeTarget \\"mywelp\\""/g' ios/App/App.xcodeproj/project.pbxproj

echo "📝 Step 6: Updating Info.plist display name..."
# Update CFBundleDisplayName to "Welp."
sed -i '' 's/<string>App<\/string>/<string>Welp.<\/string>/g' ios/App/App/Info.plist

echo "📝 Step 7: Updating Podfile target..."
sed -i '' "s/target 'App' do/target 'mywelp' do/g" ios/App/Podfile

echo "📦 Step 8: Installing CocoaPods..."
cd ios/App
pod install
cd ../..

echo "🎨 Step 9: Creating resources for icon generation..."
mkdir -p resources
cp public/favicon.svg resources/icon.svg

# Create splash.svg
cat > resources/splash.svg << 'EOF'
<svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
  <rect width="2732" height="2732" fill="#ea384c"/>
  <g transform="translate(1366, 1366) scale(30) rotate(12)">
    <path d="M 0.3 0 Q 2.9 -1.6 5.4 -0.8 Q 6.1 0 5.4 0.8 Q 2.9 1.6 0.3 0" fill="white"/>
    <g transform="rotate(72)">
      <path d="M 0.3 0 Q 2.9 -1.6 5.4 -0.8 Q 6.1 0 5.4 0.8 Q 2.9 1.6 0.3 0" fill="white"/>
    </g>
    <g transform="rotate(144)">
      <path d="M 0.3 0 Q 2.9 -1.6 5.4 -0.8 Q 6.1 0 5.4 0.8 Q 2.9 1.6 0.3 0" fill="white"/>
    </g>
    <g transform="rotate(216)">
      <path d="M 0.3 0 Q 2.9 -1.6 5.4 -0.8 Q 6.1 0 5.4 0.8 Q 2.9 1.6 0.3 0" fill="white"/>
    </g>
    <circle cx="1.2" cy="-3.2" r="1.3" fill="white"/>
  </g>
</svg>
EOF

echo "🎨 Step 10: Generating iOS assets..."
npx @capacitor/assets generate --iconBackgroundColor '#ea384c' --splashBackgroundColor '#ea384c' --ios

echo "🧹 Step 11: Cleaning up resources folder..."
rm -rf resources

echo "🔄 Step 12: Syncing Capacitor..."
npx cap sync ios

echo "✅ Done! Opening Xcode..."
npx cap open ios

echo ""
echo "================================================"
echo "✅ iOS project recreated successfully!"
echo "================================================"
echo "Configuration:"
echo "  - Scheme/Target: mywelp"
echo "  - Display Name: Welp."
echo "  - Bundle ID: com.mywelp.welp"
echo "  - Icons: Red Welp branding"
echo ""
echo "Next: Build in Xcode (⌘+R)"
echo "================================================"
