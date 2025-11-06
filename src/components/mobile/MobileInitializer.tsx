import React, { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * Wrapper component for mobile initialization
 * Handles deep linking for external payment flows (Stripe)
 */
const MobileInitializer: React.FC = () => {
  const navigate = useNavigate();
  const componentLogger = logger.withContext('MobileInitializer');

  useEffect(() => {
    // Listen for app URL open events (deep links)
    const appUrlOpenListener = CapacitorApp.addListener('appUrlOpen', (event) => {
      componentLogger.debug('Deep link received:', event.url);

      try {
        const url = new URL(event.url);

        // Extract the path and query parameters
        // Example: welpapp://profile/billing?success=true&credits=true&session_id=xxx
        const path = url.pathname || '/';
        const searchParams = url.search || '';

        componentLogger.debug('Navigating to:', path + searchParams);

        // Navigate to the appropriate route with parameters
        navigate(path + searchParams);
      } catch (error) {
        componentLogger.error('Error processing deep link:', error);
      }
    });

    // Cleanup listener on unmount
    return () => {
      appUrlOpenListener.then(listener => listener.remove());
    };
  }, [navigate]);

  return null;
};

export default MobileInitializer;