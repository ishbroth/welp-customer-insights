import { useEffect, useRef, useCallback } from 'react';
import { isNativeApp } from '@/utils/platform';
import { logger } from '@/utils/logger';

const inactivityLogger = logger.withContext('InactivityTimeout');

// 1 hour in milliseconds
const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

interface UseInactivityTimeoutOptions {
  enabled: boolean; // Should be true when Remember Me is unchecked
  onTimeout: () => void; // Function to call when timeout expires (logout)
}

/**
 * Hook to track user inactivity and logout after 1 hour of no activity
 * Only runs when Remember Me is unchecked and on web browsers (not native apps)
 */
export const useInactivityTimeout = ({ enabled, onTimeout }: UseInactivityTimeoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Don't run on native apps
  if (isNativeApp()) {
    return;
  }

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      inactivityLogger.info('User inactive for 1 hour - logging out');
      onTimeout();
    }, INACTIVITY_TIMEOUT);

    inactivityLogger.debug('Inactivity timer reset');
  }, [enabled, onTimeout]);

  // Track user activity
  useEffect(() => {
    if (!enabled) {
      // Clear any existing timer if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    inactivityLogger.debug('Starting inactivity tracking (1 hour timeout)');

    // Events to track as user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      inactivityLogger.debug('Inactivity tracking stopped');
    };
  }, [enabled, resetTimer]);
};
