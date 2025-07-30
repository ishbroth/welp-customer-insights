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
      // Include if effectively claimed (responded to or unlocked via credits)
      if (review.isEffectivelyClaimed || review.hasUserResponded || review.isReviewUnlocked) {
        return true;
      }
      
      // Include if 80% match or higher
      if (review.matchScore && review.matchScore >= 80) {
        return true;
      }
      
      return false;
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

      // Gray out if user is not subscribed AND hasn't unlocked any reviews AND no high-quality matches
      if (!isSubscribed && !hasFullAccess) {
        const hasUnlockedReviews = reviews.some(review => review.isReviewUnlocked || review.hasUserResponded);
        const hasHighQualityMatches = reviews.some(review => review.matchScore && review.matchScore >= 80);
        
        if (!hasUnlockedReviews && !hasHighQualityMatches) {
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