
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.01e840ab04ff4c6cb5f891237d529da9',
  appName: 'Welp. - Review Customers',
  webDir: 'dist',
  server: {
    url: 'https://www.welpbiz.com',
    cleartext: true
  },
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
