
import React, { useState } from "react";

/**
 * Hook for guest access utilities
 */
export const useGuestAccessUtils = () => {
  const [guestAccessTokens, setGuestAccessTokens] = useState<string[]>([]);

  const hasGuestAccess = (reviewId: string) => {
    return guestAccessTokens.includes(reviewId);
  };

  const addGuestAccess = (reviewId: string) => {
    setGuestAccessTokens(prev => [...prev, reviewId]);
  };

  const removeGuestAccess = (reviewId: string) => {
    setGuestAccessTokens(prev => prev.filter(id => id !== reviewId));
  };

  return {
    guestAccessTokens,
    setGuestAccessTokens,
    hasGuestAccess,
    addGuestAccess,
    removeGuestAccess
  };
};
