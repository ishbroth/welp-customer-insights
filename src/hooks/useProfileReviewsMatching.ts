
import { supabase } from "@/integrations/supabase/client";
import { useReviewMatching } from "@/hooks/useReviewMatching";

export const useProfileReviewsMatching = () => {
  const { checkReviewMatch } = useReviewMatching();

  const categorizeReviews = async (currentUser: any) => {
    console.log("🔍 Categorizing reviews for user:", currentUser?.id);
    
    // First, fetch permanently associated reviews for this customer
    const { data: associations, error: associationsError } = await supabase
      .from('customer_review_associations')
      .select('review_id, association_type, created_at')
      .eq('customer_id', currentUser?.id);

    if (associationsError) {
      console.error("❌ Error fetching review associations:", associationsError);
    }

    const associatedReviewIds = associations?.map(a => a.review_id) || [];
    
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

    // Also fetch all associated review IDs (from all customers) to exclude from matching
    const { data: allAssociations, error: allAssociationsError } = await supabase
      .from('customer_review_associations')
      .select('review_id');

    if (allAssociationsError) {
      console.error("❌ Error fetching all associations:", allAssociationsError);
    }

    const allAssociatedReviewIds = allAssociations?.map(a => a.review_id) || [];


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

    // Separate permanent reviews from potential matches
    const permanentReviews: any[] = [];
    const potentialMatches: any[] = [];

    (enrichedReviews || []).forEach(review => {
      // Skip reviews written BY the current user
      if (review.business_id === currentUser?.id) {
        return;
      }

      // Check if this review is permanently associated with the current customer
      if (associatedReviewIds.includes(review.id)) {
        permanentReviews.push({
          review: {
            ...review,
            // Map database fields to the expected Review interface format
            reviewerId: review.business_id || '',
            customerId: review.customer_id || '',
            reviewerName: review.profiles?.name || 'Business',
            reviewerAvatar: review.profiles?.avatar || '',
            reviewerVerified: review.profiles?.verified || false,
            customerName: review.customer_name,
            customer_phone: review.customer_phone,
            isClaimed: true // Mark as claimed since it's permanently associated
          },
          matchType: 'claimed',
          matchScore: 100,
          matchReasons: ['Permanently associated'],
          detailedMatches: []
        });
        return;
      }

      // Skip if this review is associated with ANY customer (exclude from potential matches)
      if (allAssociatedReviewIds.includes(review.id)) {
        return;
      }

      // Check if review matches the current user for potential matches
      const matchResult = checkReviewMatch(review, currentUser);
      
      // Show matches with score >= 30
      if (matchResult.score >= 30) {
        const matchType = matchResult.score >= 80 ? 'high_quality' : 'potential';
        
        potentialMatches.push({
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
        });
      }
    });

    // Sort permanent reviews by date (newest first)
    permanentReviews.sort((a, b) => {
      return new Date(b.review.created_at).getTime() - new Date(a.review.created_at).getTime();
    });

    // Sort potential matches by match score first, then by date
    potentialMatches.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.review.created_at).getTime() - new Date(a.review.created_at).getTime();
    });
    
    return {
      permanentReviews,
      potentialMatches,
      // For backward compatibility, combine both arrays
      allMatches: [...permanentReviews, ...potentialMatches]
    };
  };

  return { categorizeReviews };
};
