import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Opens Stripe checkout URL in same tab to avoid popup blockers
 * User will be redirected back to the site after checkout completion
 */
export const openStripeCheckout = (url: string) => {
  window.location.href = url;
};

/**
 * Hook that returns a Stripe checkout function
 */
export const useStripeCheckout = () => {
  return {
    openCheckout: (url: string) => openStripeCheckout(url)
  };
};