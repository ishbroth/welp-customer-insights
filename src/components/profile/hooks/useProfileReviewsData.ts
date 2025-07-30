
import { useState, useEffect } from "react";
import { useReviewAccess } from "@/hooks/useReviewAccess";

export const useProfileReviewsData = (customerReviews: any[], currentUser: any) => {
  const [localReviews, setLocalReviews] = useState(customerReviews);
  const { isReviewUnlocked } = useReviewAccess();
  
  const isCustomerUser = currentUser?.type === "customer";
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";

  // Update local reviews when customerReviews prop changes
  useEffect(() => {
    console.log('🎯 useProfileReviewsData: Updating local reviews with new data', {
      newReviewsCount: customerReviews.length,
      claimedCount: customerReviews.filter(r => r.isClaimed).length
    });
    setLocalReviews(customerReviews);
  }, [customerReviews]);

  let claimedReviews: any[] = [];
  let unclaimedReviews: any[] = [];
  let sortedReviews: any[] = [];

  if (isCustomerUser) {
    // Check if user has subscription/legacy access  
    const hasFullAccess = currentUser?.subscription_status === 'active' || currentUser?.type === 'legacy';
    
    // Determine which reviews are "claimed" (unlocked by payment or responded to)
    const reviewsWithClaimStatus = localReviews.map(review => ({
      ...review,
      isEffectivelyClaimed: review.isClaimed === true || 
                           review.hasUserResponded === true || 
                           isReviewUnlocked(review.id) ||
                           (hasFullAccess && review.matchType && ['high_quality', 'potential'].includes(review.matchType))
    }));

    // Use the isClaimed property to determine claim status (for backwards compatibility)
    claimedReviews = reviewsWithClaimStatus.filter(review => review.isClaimed === true);
    unclaimedReviews = reviewsWithClaimStatus.filter(review => review.isClaimed !== true);

    console.log('🎯 useProfileReviewsData: Review categorization', {
      totalReviews: localReviews.length,
      claimedReviews: claimedReviews.length,
      unclaimedReviews: unclaimedReviews.length,
      hasFullAccess,
      claimedIds: claimedReviews.map(r => r.id),
      unclaimedIds: unclaimedReviews.map(r => r.id)
    });

    if (hasFullAccess) {
      // For subscribed users: sort by responded status first, then match score/date
      sortedReviews = reviewsWithClaimStatus.sort((a, b) => {
        const aData = a as any;
        const bData = b as any;
        
        // User responded reviews first
        if (aData.hasUserResponded && !bData.hasUserResponded) return -1;
        if (!aData.hasUserResponded && bData.hasUserResponded) return 1;
        
        // New reviews next
        if (aData.isNewReview && !bData.isNewReview) return -1;
        if (!aData.isNewReview && bData.isNewReview) return 1;
        
        // Then by match quality
        if (aData.matchType === 'high_quality' && bData.matchType === 'potential') return -1;
        if (aData.matchType === 'potential' && bData.matchType === 'high_quality') return 1;
        
        // Finally by match score, then date
        if (aData.matchScore !== bData.matchScore) return (bData.matchScore || 0) - (aData.matchScore || 0);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    } else {
      // For non-subscribers: sort by unlocked/responded status first, then match score/date
      sortedReviews = reviewsWithClaimStatus.sort((a, b) => {
        const aData = a as any;
        const bData = b as any;
        
        // Effectively claimed reviews (unlocked/responded) first
        if (aData.isEffectivelyClaimed && !bData.isEffectivelyClaimed) return -1;
        if (!aData.isEffectivelyClaimed && bData.isEffectivelyClaimed) return 1;
        
        // Then by claimed status (for backwards compatibility)
        if (aData.isClaimed && !bData.isClaimed) return -1;
        if (!aData.isClaimed && bData.isClaimed) return 1;
        
        // New reviews next
        if (aData.isNewReview && !bData.isNewReview) return -1;
        if (!aData.isNewReview && bData.isNewReview) return 1;
        
        // Then by match quality
        if (aData.matchType === 'high_quality' && bData.matchType === 'potential') return -1;
        if (aData.matchType === 'potential' && bData.matchType === 'high_quality') return 1;
        
        // Finally by match score, then date
        if (aData.matchScore !== bData.matchScore) return (bData.matchScore || 0) - (aData.matchScore || 0);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
  } else {
    // For business users, use original sorting
    sortedReviews = [...localReviews].sort((a, b) => {
      const aData = a as any;
      const bData = b as any;
      
      // New reviews first
      if (aData.isNewReview && !bData.isNewReview) return -1;
      if (!aData.isNewReview && bData.isNewReview) return 1;
      
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  return {
    localReviews,
    claimedReviews,
    unclaimedReviews,
    sortedReviews,
    isCustomerUser,
    isBusinessUser
  };
};
