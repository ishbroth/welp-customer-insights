import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types";
import { useAuth } from "@/contexts/auth";
import { useReviewClaims } from "./useReviewClaims";
import { doesReviewMatchUser } from "@/utils/reviewMatching";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useBusinessProfileReviews');

export const useBusinessProfileReviews = (businessId: string | undefined, hasAccess: boolean) => {
  const { currentUser, isSubscribed } = useAuth();
  const { isReviewClaimedByUser } = useReviewClaims();
  
  const { 
    data: reviews, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['businessProfileReviews', businessId, currentUser?.id],
    queryFn: async () => {
      if (!businessId || !hasAccess) {
        return [];
      }

      hookLogger.info("Fetching reviews for business ID:", businessId);
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .or('is_anonymous.is.null,is_anonymous.eq.false')
        .order('created_at', { ascending: false });
      
      if (error) {
        hookLogger.error("Error fetching business reviews:", error);
        throw error;
      }
      
      // Transform the data to match the Review type and load reactions from localStorage
      const transformedReviews: Review[] = await Promise.all((data || []).map(async (review) => {
        // Load reactions from localStorage for this review
        const storageKey = `reactions_${review.id}`;
        const storedReactions = localStorage.getItem(storageKey);
        let reactions = { like: [], funny: [], ohNo: [] };
        
        if (storedReactions) {
          try {
            const parsed = JSON.parse(storedReactions);
            // Ensure we only keep valid reaction types
            reactions = {
              like: Array.isArray(parsed.like) ? parsed.like : [],
              funny: Array.isArray(parsed.funny) ? parsed.funny : [],
              ohNo: Array.isArray(parsed.ohNo) ? parsed.ohNo : []
            };
            hookLogger.debug(`Loaded reactions for review ${review.id}:`, reactions);
          } catch (error) {
            hookLogger.error('Error parsing stored reactions:', error);
          }
        } else {
          hookLogger.debug(`No stored reactions found for review ${review.id}`);
        }

        // Check if this review is claimed by the current user
        const isClaimed = currentUser ? await isReviewClaimedByUser(review.id) : false;

        // Check if this review matches the current user's profile (for customer users)
        const matchesCurrentUser = currentUser?.type === 'customer' ? 
          doesReviewMatchUser(review, currentUser, currentUser) : true;

        // Determine unlock status based on user type and review matching
        let isUnlocked = false;
        if (currentUser?.type === 'business') {
          // Business users can unlock any review with subscription or claimed status
          isUnlocked = isClaimed || isSubscribed;
        } else if (currentUser?.type === 'customer') {
          // Customer users can only unlock reviews written about them by this specific business
          const isReviewAboutCurrentUser = matchesCurrentUser && review.business_id === businessId;
          isUnlocked = isReviewAboutCurrentUser && (isClaimed || isSubscribed);
        }

        const transformedReview = {
          id: review.id,
          reviewerId: review.business_id || '',
          reviewerName: review.customer_name || 'Anonymous',
          customerId: isClaimed ? currentUser?.id || '' : '',
          customerName: review.customer_name || 'Anonymous',
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          location: `${review.customer_city || ''}, ${review.customer_zipcode || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') || 'Unknown',
          reactions: reactions,
          responses: [],
          isClaimed,
          matchesCurrentUser,
          // Add access control flags
          isUnlocked,
          canReact: !!currentUser,
          canRespond: isClaimed && currentUser?.type === 'customer'
        };

        hookLogger.debug(`Transformed review ${review.id}:`, transformedReview);
        return transformedReview;
      }));
      
      // Sort reviews: claimed reviews first for customer users
      const sortedReviews = transformedReviews.sort((a, b) => {
        if (currentUser?.type === 'customer') {
          // For customer users, prioritize claimed reviews
          if (a.isClaimed && !b.isClaimed) return -1;
          if (!a.isClaimed && b.isClaimed) return 1;
        }
        // Then sort by date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      hookLogger.debug("All transformed business reviews:", sortedReviews);
      return sortedReviews;
    },
    enabled: !!businessId && hasAccess,
    retry: 1
  });

  return {
    reviews,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
