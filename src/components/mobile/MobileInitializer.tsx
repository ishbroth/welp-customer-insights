import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { initializeIAP, isIOSNative } from '@/services/iapService';
import { logger } from '@/utils/logger';

const initLogger = logger.withContext('MobileInitializer');

/**
 * Wrapper component to initialize mobile features that depend on auth context
 * - Initializes RevenueCat IAP for iOS
 */
const MobileInitializer: React.FC = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    // Initialize IAP when user is logged in on iOS
    if (currentUser && isIOSNative()) {
      initLogger.info('Initializing IAP for user:', currentUser.id);
      initializeIAP(currentUser.id)
        .then(success => {
          if (success) {
            initLogger.info('IAP initialized successfully');
          } else {
            initLogger.warn('IAP initialization returned false');
          }
        })
        .catch(error => {
          initLogger.error('IAP initialization error:', error);
        });
    }
  }, [currentUser]);

  // This component doesn't render anything visible
  return null;
};

export default MobileInitializer;