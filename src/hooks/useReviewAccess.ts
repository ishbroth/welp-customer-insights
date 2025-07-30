import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useReviewClaims } from './useReviewClaims';

export const useReviewAccess = () => {
  const { currentUser } = useAuth();
  const { claimReview, isReviewClaimedByUser } = useReviewClaims();
  const [unlockedReviews, setUnlockedReviews] = useState<Set<string>>(new Set());

  // Check if a review is unlocked (claimed by current user or they have active subscription)
  const isReviewUnlocked = (reviewId: string): boolean => {
    return unlockedReviews.has(reviewId);
  };

  // Add a review to unlocked set and claim it in database
  const addUnlockedReview = async (reviewId: string, creditTransactionId?: string): Promise<boolean> => {
    if (!currentUser) return false;

    // Try to claim the review atomically
    const success = await claimReview(reviewId, 'credit_unlock', creditTransactionId);
    
    if (success) {
      setUnlockedReviews(prev => new Set(prev).add(reviewId));
      return true;
    }
    
    return false;
  };

  // Refresh access list (fetch all reviews claimed by current user)
  const refreshAccess = async () => {
    if (!currentUser) {
      setUnlockedReviews(new Set());
      return;
    }

    try {
      const { data: claims, error } = await supabase
        .from('review_claims')
        .select('review_id')
        .eq('claimed_by', currentUser.id);

      if (error) {
        console.error('Error fetching user claims:', error);
        return;
      }

      const claimedReviewIds = claims?.map(claim => claim.review_id) || [];
      setUnlockedReviews(new Set(claimedReviewIds));
      console.log(`✅ Refreshed access: ${claimedReviewIds.length} claimed reviews`);
    } catch (error) {
      console.error('Error in refreshAccess:', error);
    }
  };

  // Load initial access on mount and user change
  useEffect(() => {
    refreshAccess();
  }, [currentUser]);

  return {
    isReviewUnlocked,
    addUnlockedReview,
    refreshAccess,
    unlockedReviews: Array.from(unlockedReviews)
  };
};