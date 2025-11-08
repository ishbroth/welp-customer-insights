
import { CapacitorConfig } from '@capacitor/cli';

// Use production URL for production builds, development for dev mode
const isDev = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.mywelp.dev',
  appName: 'Welp.',
  webDir: 'dist',
  ...(isDev && {
    server: {
      url: 'http://localhost:8082',
      cleartext: true
    }
  }),
  ios: {
    // Disable automatic safe area insets
    contentInset: 'never',
    // Enable web debugging in development
    webContentsDebuggingEnabled: isDev
  },
  android: {
    // Allow mixed content for local development
    allowMixedContent: isDev,
    // Enable web debugging in development
    webContentsDebuggingEnabled: isDev
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#ea384c",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      spinnerColor: "#ffffff"
    },
    Camera: {
      permissions: ["camera", "photos"]
    },
    App: {
      deepLinkingEnabled: true,
      customScheme: "welpapp"
    }
  }
};

export default config;
