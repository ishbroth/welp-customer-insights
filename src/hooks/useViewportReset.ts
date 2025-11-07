import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to reset viewport zoom on route navigation (iOS only)
 * Prevents zoom from persisting across page changes
 */
export const useViewportReset = () => {
  const location = useLocation();

  useEffect(() => {
    // Only run on iOS native app
    if (Capacitor.getPlatform() !== 'ios') {
      return;
    }

    // Reset viewport zoom to default scale
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const content = viewport.getAttribute('content');
      if (content) {
        // Force a viewport update by temporarily changing and restoring
        viewport.setAttribute('content', content + ', minimum-scale=1.0');
        setTimeout(() => {
          viewport.setAttribute('content', content);
        }, 10);
      }
    }

    // Alternative: Try to reset zoom via window
    if ((window as any).visualViewport) {
      (window as any).visualViewport.scale = 1;
    }
  }, [location.pathname]); // Reset on route change
};
