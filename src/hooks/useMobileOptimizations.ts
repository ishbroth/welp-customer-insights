import { useCallback, useMemo } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * Hook for mobile-specific performance optimizations
 */
export const useMobileOptimizations = () => {
  const isMobile = useIsMobile();

  // Mobile-specific debounce function with shorter delay
  const createMobileDebounce = useCallback((fn: Function, delay: number = 150) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), isMobile ? delay : delay * 2);
    };
  }, [isMobile]);

  // Mobile-specific throttle for scroll events
  const createMobileThrottle = useCallback((fn: Function, limit: number = 16) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, isMobile ? limit : limit * 2);
      }
    };
  }, [isMobile]);

  // Optimize touch events for mobile
  const touchEventOptions = useMemo(() => 
    isMobile ? { passive: true, capture: false } : {}
  , [isMobile]);

  // Mobile-specific intersection observer options
  const intersectionOptions = useMemo(() => ({
    rootMargin: isMobile ? '50px' : '100px',
    threshold: isMobile ? 0.1 : 0.25
  }), [isMobile]);

  return {
    isMobile,
    createMobileDebounce,
    createMobileThrottle,
    touchEventOptions,
    intersectionOptions
  };
};