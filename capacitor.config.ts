
import { CapacitorConfig } from '@capacitor/cli';

// Use production URL for production builds, development for dev mode
const isDev = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.welp.customerinsights',
  appName: 'Welp. - Review Customers',
  webDir: 'dist',
  ...(isDev && {
    server: {
      url: 'https://01e840ab-04ff-4c6c-b5f8-91237d529da9.lovableproject.com?forceHideBadge=true',
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
