
import { supabase } from "@/integrations/supabase/client";
import { useReviewMatching } from "@/hooks/useReviewMatching";

export const useProfileReviewsMatching = () => {
  const { checkReviewMatch } = useReviewMatching();

  const categorizeReviews = async (currentUser: any) => {
    console.log("🔍 Categorizing reviews for user:", currentUser?.id);
    
    // Fetch all reviews with business profile information and responses
    const { data: allReviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles!business_id(
          name,
          avatar,
          verified,
          type
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });


    if (error) {
      console.error("❌ Error fetching reviews:", error);
      return [];
    }

    const reviewMatches = (allReviews || []).map(review => {
      // Skip reviews written BY the current user
      if (review.business_id === currentUser?.id) {
        return null;
      }

      // Check if review matches the current user
      const matchResult = checkReviewMatch(review, currentUser);
      
      // Show matches with score >= 30
      if (matchResult.score >= 30) {
        const matchType = matchResult.score >= 80 ? 'high_quality' : 'potential';
        
        return {
          review: {
            ...review,
            // Map database fields to the expected Review interface format
            reviewerId: review.business_id || '',
            customerId: '',
            reviewerName: review.profiles?.name || 'Business',
            reviewerAvatar: review.profiles?.avatar || '',
            reviewerVerified: review.profiles?.verified || false,
            customerName: review.customer_name,
            customer_phone: review.customer_phone
          },
          matchType,
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons,
          detailedMatches: matchResult.detailedMatches || []
        };
      }

      return null;
    }).filter(match => match !== null);

    // Sort by match score first, then by date
    reviewMatches.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.review.created_at).getTime() - new Date(a.review.created_at).getTime();
    });
    
    return reviewMatches;
  };

  return { categorizeReviews };
};
