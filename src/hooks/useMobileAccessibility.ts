import { useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * Hook for mobile accessibility enhancements
 */
export const useMobileAccessibility = () => {
  const isMobile = useIsMobile();

  // Announce screen reader updates for mobile
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!isMobile) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [isMobile]);

  // Focus management for mobile navigation
  const focusFirstInteractive = useCallback((container?: HTMLElement) => {
    if (!isMobile) return;

    const target = container || document;
    const firstInteractive = target.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (firstInteractive) {
      firstInteractive.focus();
    }
  }, [isMobile]);

  // Enhanced touch target sizes for mobile
  useEffect(() => {
    if (!isMobile) return;

    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 767px) {
        button, [role="button"], input[type="submit"], input[type="button"] {
          min-height: 44px !important;
          min-width: 44px !important;
        }
        
        a, [role="link"] {
          min-height: 44px !important;
          display: inline-flex !important;
          align-items: center !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isMobile]);

  return {
    isMobile,
    announceToScreenReader,
    focusFirstInteractive
  };
};