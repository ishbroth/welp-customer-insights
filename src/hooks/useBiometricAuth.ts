import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

/**
 * Hook for Face ID / Touch ID biometric authentication
 * Provides methods to check availability and authenticate users
 */
export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType | undefined>();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) {
      setIsAvailable(false);
      return;
    }

    // Check if biometrics are available
    const checkAvailability = async () => {
      try {
        const result = await BiometricAuth.checkBiometry();
        setIsAvailable(result.isAvailable);
        setBiometryType(result.biometryType);
      } catch (error) {
        console.debug('Biometric auth not available:', error);
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, [isNative]);

  /**
   * Authenticate the user with biometrics
   * @param reason - The reason for authentication shown to the user
   * @returns Promise with authentication result
   */
  const authenticate = async (reason: string = 'Verify your identity') => {
    if (!isNative || !isAvailable) {
      return { success: false, error: 'Biometric authentication not available' };
    }

    try {
      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Cancel',
        iosFallbackTitle: 'Use Passcode',
        androidTitle: 'Biometric Authentication',
        androidSubtitle: reason,
        androidConfirmationRequired: false,
        androidBiometryStrength: 'strong'
      });

      return { success: true };
    } catch (error: any) {
      console.debug('Biometric authentication failed:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
        code: error.code
      };
    }
  };

  /**
   * Get a user-friendly name for the biometry type
   */
  const getBiometryName = () => {
    switch (biometryType) {
      case BiometryType.faceId:
        return 'Face ID';
      case BiometryType.touchId:
        return 'Touch ID';
      case BiometryType.fingerprintAuthentication:
        return 'Fingerprint';
      case BiometryType.faceAuthentication:
        return 'Face Authentication';
      case BiometryType.irisAuthentication:
        return 'Iris Authentication';
      default:
        return 'Biometric Authentication';
    }
  };

  return {
    isAvailable,
    biometryType,
    biometryName: getBiometryName(),
    authenticate,
    isNative
  };
};
