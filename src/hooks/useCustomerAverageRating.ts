import { useMemo } from 'react';

interface Review {
  rating: number;
  isEffectivelyClaimed?: boolean;
  matchScore?: number;
  hasUserResponded?: boolean;
  isReviewUnlocked?: boolean;
}

interface UseCustomerAverageRatingProps {
  reviews: Review[];
  isSubscribed: boolean;
  hasFullAccess: boolean;
}

export const useCustomerAverageRating = ({ 
  reviews, 
  isSubscribed, 
  hasFullAccess 
}: UseCustomerAverageRatingProps) => {
  return useMemo(() => {
    // Filter reviews that count towards the average rating
    const qualifyingReviews = reviews.filter(review => {
      // Only include reviews if user has paid for access through subscription/legacy OR credits
      if (!isSubscribed && !hasFullAccess) {
        // Without subscription, only count reviews that were specifically unlocked with credits
        return review.isReviewUnlocked || review.hasUserResponded;
      }
      
      // With subscription/legacy access, include effectively claimed reviews or unlocked reviews
      return review.isEffectivelyClaimed || review.hasUserResponded || review.isReviewUnlocked;
    });

    // Calculate average rating
    const averageRating = qualifyingReviews.length > 0 
      ? qualifyingReviews.reduce((sum, review) => sum + review.rating, 0) / qualifyingReviews.length
      : 0;

    // Determine if stars should be grayed out
    const shouldGrayOut = (() => {
      // Gray out if no qualifying reviews
      if (qualifyingReviews.length === 0) {
        return true;
      }

      // Gray out if user hasn't paid for access (no subscription AND no unlocked reviews via credits)
      if (!isSubscribed && !hasFullAccess) {
        const hasUnlockedReviews = reviews.some(review => review.isReviewUnlocked || review.hasUserResponded);
        
        if (!hasUnlockedReviews) {
          return true;
        }
      }

      return false;
    })();

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      shouldGrayOut,
      reviewCount: qualifyingReviews.length,
      totalReviews: reviews.length
    };
  }, [reviews, isSubscribed, hasFullAccess]);
};