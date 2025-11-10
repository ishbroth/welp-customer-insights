import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useHaptics } from './useHaptics';

/**
 * Hook for accessing native camera and photo library
 * Uses Capacitor Camera plugin for native feel on iOS/Android
 */
export const useNativeCamera = () => {
  const haptics = useHaptics();
  const isNative = Capacitor.isNativePlatform();

  /**
   * Pick a photo from the photo library
   * @returns Base64 data URL of the selected image
   */
  const pickPhoto = async (): Promise<{ success: boolean; dataUrl?: string; error?: string }> => {
    try {
      // Light haptic when opening photo picker
      haptics.light();

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos, // Photo library only
        width: 1024, // Max width for optimization
        height: 1024, // Max height for optimization
        correctOrientation: true,
        saveToGallery: false
      });

      if (photo.dataUrl) {
        // Success haptic
        haptics.success();
        return { success: true, dataUrl: photo.dataUrl };
      } else {
        return { success: false, error: 'No image data received' };
      }
    } catch (error: any) {
      // User canceled or error
      console.debug('Photo picker canceled or failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to pick photo'
      };
    }
  };

  /**
   * Take a photo with the camera
   * @returns Base64 data URL of the captured image
   */
  const takePhoto = async (): Promise<{ success: boolean; dataUrl?: string; error?: string }> => {
    try {
      // Light haptic when opening camera
      haptics.light();

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera, // Camera only
        width: 1024,
        height: 1024,
        correctOrientation: true,
        saveToGallery: false
      });

      if (photo.dataUrl) {
        // Success haptic
        haptics.success();
        return { success: true, dataUrl: photo.dataUrl };
      } else {
        return { success: false, error: 'No image data received' };
      }
    } catch (error: any) {
      // User canceled or error
      console.debug('Camera canceled or failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to take photo'
      };
    }
  };

  /**
   * Show prompt to choose between camera and photo library
   * @returns Base64 data URL of the selected/captured image
   */
  const choosePhoto = async (): Promise<{ success: boolean; dataUrl?: string; error?: string }> => {
    try {
      // Light haptic when opening picker
      haptics.light();

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Let user choose camera or library
        width: 1024,
        height: 1024,
        correctOrientation: true,
        saveToGallery: false
      });

      if (photo.dataUrl) {
        // Success haptic
        haptics.success();
        return { success: true, dataUrl: photo.dataUrl };
      } else {
        return { success: false, error: 'No image data received' };
      }
    } catch (error: any) {
      // User canceled or error
      console.debug('Photo selection canceled or failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to select photo'
      };
    }
  };

  return {
    pickPhoto,
    takePhoto,
    choosePhoto,
    isAvailable: isNative
  };
};
