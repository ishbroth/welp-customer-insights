
import { CapacitorConfig } from '@capacitor/cli';

// Use production URL for production builds, development for dev mode
const isDev = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.mywelp.welp',
  appName: 'Welp.',
  webDir: 'dist',
  ...(isDev && {
    server: {
      url: 'http://localhost:8082',
      cleartext: true
    }
  }),
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ea384c",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      spinnerColor: "#ffffff"
    },
    Camera: {
      permissions: ["camera", "photos"]
    }
  }
};

export default config;
