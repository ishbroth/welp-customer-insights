
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface ReviewAccessState {
  unlockedReviews: Set<string>;
  isLoading: boolean;
}

export const useReviewAccess = () => {
  const { currentUser } = useAuth();
  const [accessState, setAccessState] = useState<ReviewAccessState>({
    unlockedReviews: new Set(),
    isLoading: true
  });

  useEffect(() => {
    const loadUnlockedReviews = async () => {
      if (!currentUser) {
        setAccessState({ unlockedReviews: new Set(), isLoading: false });
        return;
      }

      try {
        setAccessState(prev => ({ ...prev, isLoading: true }));
        
        // Query credit transactions for review unlocks
        const { data: transactions, error } = await supabase
          .from('credit_transactions')
          .select('description')
          .eq('user_id', currentUser.id)
          .eq('type', 'usage')
          .like('description', 'Unlocked review %');

        if (error) {
          console.error("Error loading unlocked reviews:", error);
          setAccessState({ unlockedReviews: new Set(), isLoading: false });
          return;
        }

        // Extract review IDs from descriptions
        const unlockedReviewIds = new Set<string>();
        transactions?.forEach(transaction => {
          if (transaction.description) {
            const match = transaction.description.match(/Unlocked review (.+)/);
            if (match && match[1]) {
              unlockedReviewIds.add(match[1]);
            }
          }
        });

        console.log('🎯 Loaded unlocked reviews:', Array.from(unlockedReviewIds));
        setAccessState({ unlockedReviews: unlockedReviewIds, isLoading: false });
      } catch (error) {
        console.error("Error in loadUnlockedReviews:", error);
        setAccessState({ unlockedReviews: new Set(), isLoading: false });
      }
    };

    loadUnlockedReviews();
  }, [currentUser]);

  const isReviewUnlocked = (reviewId: string): boolean => {
    return accessState.unlockedReviews.has(reviewId);
  };

  const addUnlockedReview = (reviewId: string) => {
    setAccessState(prev => ({
      ...prev,
      unlockedReviews: new Set([...prev.unlockedReviews, reviewId])
    }));
  };

  const refreshAccess = async () => {
    if (!currentUser) return;
    
    try {
      const { data: transactions, error } = await supabase
        .from('credit_transactions')
        .select('description')
        .eq('user_id', currentUser.id)
        .eq('type', 'usage')
        .like('description', 'Unlocked review %');

      if (error) {
        console.error("Error refreshing unlocked reviews:", error);
        return;
      }

      const unlockedReviewIds = new Set<string>();
      transactions?.forEach(transaction => {
        if (transaction.description) {
          const match = transaction.description.match(/Unlocked review (.+)/);
          if (match && match[1]) {
            unlockedReviewIds.add(match[1]);
          }
        }
      });

      setAccessState(prev => ({ ...prev, unlockedReviews: unlockedReviewIds }));
    } catch (error) {
      console.error("Error in refreshAccess:", error);
    }
  };

  return {
    isReviewUnlocked,
    addUnlockedReview,
    refreshAccess,
    isLoading: accessState.isLoading
  };
};
