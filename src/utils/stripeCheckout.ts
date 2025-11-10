import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";

/**
 * Opens Stripe checkout URL in external browser (Safari on iOS, Chrome on Android)
 * This ensures compliance with Apple's App Store guidelines for external payments
 * User will be redirected back to the app after checkout completion via deep linking
 */
export const openStripeCheckout = (url: string) => {
  // On native mobile apps, open in external browser to comply with Apple's guidelines
  if (Capacitor.isNativePlatform()) {
    // Use window.open with _blank and specific features to force external browser
    // On iOS, this opens Safari; on Android, this opens Chrome
    window.open(url, '_blank', 'location=yes');
  } else {
    // On web, navigate normally in the same tab
    window.location.href = url;
  }
};

/**
 * Hook that returns a Stripe checkout function
 */
export const useStripeCheckout = () => {
  return {
    openCheckout: (url: string) => openStripeCheckout(url)
  };
};