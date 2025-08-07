import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Opens Stripe checkout URL with device-appropriate behavior
 * - Mobile: Same tab (window.location.href) to avoid popup blockers
 * - Desktop: New tab (window.open) for better UX
 */
export const openStripeCheckout = (url: string, isMobile: boolean = false) => {
  if (isMobile) {
    // On mobile, use same tab to avoid popup blockers
    window.location.href = url;
  } else {
    // On desktop, use new tab for better UX
    window.open(url, '_blank');
  }
};

/**
 * Hook that returns a device-aware Stripe checkout function
 */
export const useStripeCheckout = () => {
  const isMobile = useIsMobile();
  
  return {
    openCheckout: (url: string) => openStripeCheckout(url, isMobile),
    isMobile
  };
};