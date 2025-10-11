
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface GuestAccessInfo {
  hasAccess: boolean;
  isExpired: boolean;
  expiresAt: string | null;
  isLoading: boolean;
}

export const useGuestAccess = (reviewId: string, guestToken?: string): GuestAccessInfo => {
  const hookLogger = logger.withContext('useGuestAccess');
  const [accessInfo, setAccessInfo] = useState<GuestAccessInfo>({
    hasAccess: false,
    isExpired: false,
    expiresAt: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkGuestAccess = async () => {
      if (!reviewId) {
        setAccessInfo({ hasAccess: false, isExpired: false, expiresAt: null, isLoading: false });
        return;
      }

      // First check sessionStorage for guest token
      let token = guestToken;
      if (!token) {
        token = sessionStorage.getItem(`guest_token_${reviewId}`) || undefined;
      }

      if (!token) {
        setAccessInfo({ hasAccess: false, isExpired: false, expiresAt: null, isLoading: false });
        return;
      }

      try {
        // Validate token against database
        const { data: accessRecord, error } = await supabase
          .from('guest_access')
          .select('expires_at')
          .eq('access_token', token)
          .eq('review_id', reviewId)
          .maybeSingle();

        if (error) {
          hookLogger.error('Error checking guest access:', error);
          setAccessInfo({ hasAccess: false, isExpired: false, expiresAt: null, isLoading: false });
          return;
        }

        if (!accessRecord) {
          // Token not found in database
          sessionStorage.removeItem(`guest_token_${reviewId}`);
          sessionStorage.removeItem(`guest_token_expires_${reviewId}`);
          setAccessInfo({ hasAccess: false, isExpired: false, expiresAt: null, isLoading: false });
          return;
        }

        const expiresAt = new Date(accessRecord.expires_at);
        const now = new Date();
        const isExpired = now > expiresAt;

        if (isExpired) {
          // Clean up expired token from sessionStorage
          sessionStorage.removeItem(`guest_token_${reviewId}`);
          sessionStorage.removeItem(`guest_token_expires_${reviewId}`);
        }

        setAccessInfo({
          hasAccess: !isExpired,
          isExpired,
          expiresAt: accessRecord.expires_at,
          isLoading: false,
        });

      } catch (error) {
        hookLogger.error('Error validating guest access:', error);
        setAccessInfo({ hasAccess: false, isExpired: false, expiresAt: null, isLoading: false });
      }
    };

    checkGuestAccess();
  }, [reviewId, guestToken]);

  return accessInfo;
};

// Helper function to check if user has any form of access to a review
export const useReviewAccess = (reviewId: string, guestToken?: string) => {
  const guestAccess = useGuestAccess(reviewId, guestToken);
  // This can be extended to include subscription access, one-time purchase access, etc.
  
  return {
    hasAccess: guestAccess.hasAccess, // Add other access types here with OR
    isLoading: guestAccess.isLoading,
    accessType: guestAccess.hasAccess ? 'guest' : null,
    expiresAt: guestAccess.expiresAt,
  };
};
