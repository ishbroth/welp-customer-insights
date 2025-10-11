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
    // ONLY include reviews that have been explicitly claimed by the current user through:
    // 1. Paying with credits (isReviewUnlocked = true AND claim exists)
    // 2. Responding while subscribed (hasUserResponded = true)
    // 3. Being marked as effectively claimed (isClaimed flag from review_claims table)
    const qualifyingReviews = reviews.filter(review => {
      // A review qualifies for star rating ONLY if user has taken action to claim it:
      // - Responded to it (explicit acknowledgment)
      // - Unlocked it with credits (explicit acknowledgment)
      // - It's marked as effectively claimed (from review_claims table)
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