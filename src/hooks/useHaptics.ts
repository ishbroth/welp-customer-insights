import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Hook for triggering haptic feedback on iOS and Android
 * Provides various haptic patterns for different user interactions
 */
export const useHaptics = () => {
  // Only attempt haptics on native platforms
  const isNative = Capacitor.isNativePlatform();

  /**
   * Light impact - for subtle interactions like button taps
   */
  const light = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  };

  /**
   * Medium impact - for standard button presses and selections
   */
  const medium = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  };

  /**
   * Heavy impact - for important actions like submitting forms
   */
  const heavy = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  };

  /**
   * Success notification - for successful operations
   */
  const success = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  };

  /**
   * Warning notification - for warnings or cautions
   */
  const warning = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  };

  /**
   * Error notification - for errors or failures
   */
  const error = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  };

  /**
   * Selection change - for when the user changes a selection
   */
  const selectionChanged = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  };

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selectionChanged,
    isAvailable: isNative
  };
};
