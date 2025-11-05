import { Capacitor } from '@capacitor/core';

/**
 * Detect if the app is running on a native platform (iOS or Android)
 * @returns true if running in native app, false if running in web browser
 */
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Detect if the app is running in a web browser
 * @returns true if running in web browser, false if native app
 */
export const isWebBrowser = (): boolean => {
  return !Capacitor.isNativePlatform();
};

/**
 * Get the current platform name
 * @returns 'ios' | 'android' | 'web'
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};
