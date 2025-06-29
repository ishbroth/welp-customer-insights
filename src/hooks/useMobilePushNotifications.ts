
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { mobilePushNotificationService } from '@/services/mobilePushNotifications';
import { Capacitor } from '@capacitor/core';

export const useMobilePushNotifications = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && Capacitor.isNativePlatform()) {
      // Initialize push notifications for the current user
      mobilePushNotificationService.initialize(currentUser.id);
    }

    // Cleanup on unmount or user change
    return () => {
      mobilePushNotificationService.cleanup();
    };
  }, [currentUser]);

  return {
    isNativePlatform: Capacitor.isNativePlatform(),
  };
};
