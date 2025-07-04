
/**
 * Hook for guest access utilities
 */
export const useGuestAccessUtils = () => {
  const hasGuestAccess = (reviewId: string): boolean => {
    const token = sessionStorage.getItem(`guest_token_${reviewId}`);
    const expiresAt = sessionStorage.getItem(`guest_token_expires_${reviewId}`);
    
    if (!token || !expiresAt) return false;
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    
    if (now > expiry) {
      // Clean up expired token
      sessionStorage.removeItem(`guest_token_${reviewId}`);
      sessionStorage.removeItem(`guest_token_expires_${reviewId}`);
      return false;
    }
    
    return true;
  };

  const getGuestToken = (reviewId: string): string | null => {
    if (!hasGuestAccess(reviewId)) return null;
    return sessionStorage.getItem(`guest_token_${reviewId}`);
  };

  const clearGuestAccess = (reviewId: string) => {
    sessionStorage.removeItem(`guest_token_${reviewId}`);
    sessionStorage.removeItem(`guest_token_expires_${reviewId}`);
  };

  return {
    hasGuestAccess,
    getGuestToken,
    clearGuestAccess
  };
};
