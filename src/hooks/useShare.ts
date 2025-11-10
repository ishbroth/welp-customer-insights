import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useHaptics } from './useHaptics';

/**
 * Hook for sharing content using native iOS/Android share sheets
 * Falls back to Web Share API on web browsers
 */
export const useShare = () => {
  const haptics = useHaptics();
  const isNative = Capacitor.isNativePlatform();

  /**
   * Share a URL with optional title and text
   */
  const shareUrl = async (options: {
    url: string;
    title?: string;
    text?: string;
  }) => {
    try {
      // Light haptic feedback when share sheet opens
      haptics.light();

      if (isNative || navigator.share) {
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: 'Share via'
        });
        return { success: true };
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(options.url);
        return { success: true, message: 'Link copied to clipboard' };
      }
    } catch (error) {
      // User canceled or error occurred
      console.debug('Share canceled or failed:', error);
      return { success: false, error };
    }
  };

  /**
   * Share a review
   */
  const shareReview = async (reviewId: string, customerName: string) => {
    const url = `${window.location.origin}/search?reviewId=${reviewId}`;
    return shareUrl({
      url,
      title: `Review of ${customerName}`,
      text: `Check out this review on Welp: ${customerName}`
    });
  };

  /**
   * Share a customer profile
   */
  const shareCustomerProfile = async (profileId: string, firstName: string, lastName: string) => {
    const url = `${window.location.origin}/customer/${profileId}`;
    return shareUrl({
      url,
      title: `${firstName} ${lastName}'s Profile`,
      text: `Check out ${firstName} ${lastName}'s profile on Welp`
    });
  };

  /**
   * Share a business profile
   */
  const shareBusinessProfile = async (profileId: string, businessName: string) => {
    const url = `${window.location.origin}/business/${profileId}`;
    return shareUrl({
      url,
      title: `${businessName} on Welp`,
      text: `Check out ${businessName} on Welp`
    });
  };

  /**
   * Check if native sharing is available
   */
  const canShare = async () => {
    try {
      const result = await Share.canShare();
      return result.value;
    } catch {
      return false;
    }
  };

  return {
    shareUrl,
    shareReview,
    shareCustomerProfile,
    shareBusinessProfile,
    canShare,
    isAvailable: isNative || !!navigator.share
  };
};
