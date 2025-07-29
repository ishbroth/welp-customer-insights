
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
        ),
        responses(
          id,
          content,
          created_at,
          author_id
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });


    if (error) {
      console.error("❌ Error fetching reviews:", error);
      return [];
    }

    // Process and enrich responses with author names for each review
    const enrichedReviews = await Promise.all((allReviews || []).map(async (review) => {
      if (review.responses && review.responses.length > 0) {
        // Get author profiles for responses
        const authorIds = review.responses.map((r: any) => r.author_id).filter(Boolean);
        
        if (authorIds.length > 0) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, name, first_name, last_name, type')
            .in('id', authorIds);

          // Enrich responses with author names
          review.responses = review.responses.map((resp: any) => {
            const profile = profileData?.find(p => p.id === resp.author_id);
            
            let authorName = 'User';
            if (profile) {
              if (profile.name && profile.name.trim()) {
                authorName = profile.name;
              } else if (profile.first_name || profile.last_name) {
                const firstName = profile.first_name || '';
                const lastName = profile.last_name || '';
                authorName = `${firstName} ${lastName}`.trim();
              } else if (profile.type) {
                authorName = profile.type === 'business' ? 'Business' : 'Customer';
              }
            }

            return {
              id: resp.id,
              content: resp.content,
              created_at: resp.created_at,
              author_id: resp.author_id,
              authorName
            };
          });
        }
      }
      
      return review;
    }));

    const reviewMatches = (enrichedReviews || []).map(review => {
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
            customerId: review.customer_id || '',
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
