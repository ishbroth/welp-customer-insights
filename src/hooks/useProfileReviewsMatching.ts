
import { supabase } from "@/integrations/supabase/client";
import { useReviewMatching } from "./useReviewMatching";
import { useBusinessProfileFetching } from "./useBusinessProfileFetching";

interface ReviewMatchData {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_zipcode?: string;
}

export const useProfileReviewsMatching = () => {
  const { checkReviewMatch } = useReviewMatching();
  const { fetchBusinessProfiles } = useBusinessProfileFetching();

  const categorizeReviews = async (currentUser: any) => {
    console.log("=== CATEGORIZING REVIEWS FOR USER ===");
    console.log("User ID:", currentUser.id);

    // Get user's current profile data
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();

    console.log("User profile:", userProfile);

    // Get user's last login to identify new reviews
    const { data: lastSession } = await supabase
      .from('user_sessions')
      .select('last_login')
      .eq('user_id', currentUser.id)
      .order('last_login', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastLoginTime = lastSession?.last_login || new Date(0).toISOString();

    // Update user's session
    await supabase
      .from('user_sessions')
      .upsert({
        user_id: currentUser.id,
        last_login: new Date().toISOString()
      });

    // Fetch all reviews with business profile data
    const { data: allReviews, error } = await supabase
      .from('reviews')
      .select(`
        id, 
        rating, 
        content, 
        created_at,
        business_id,
        customer_id,
        customer_name,
        customer_phone,
        customer_address,
        customer_city,
        customer_zipcode,
        claimed_at,
        claimed_by
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    console.log("=== RAW REVIEWS FROM DATABASE ===");
    allReviews?.forEach(review => {
      console.log(`Review ID: ${review.id}`, {
        customer_name: review.customer_name,
        customer_id_from_db: review.customer_id,
        business_id: review.business_id
      });
    });

    // Get business profiles and verification status for all reviews
    const { businessProfilesMap, businessVerificationMap } = await fetchBusinessProfiles(allReviews || []);

    const reviewMatches: any[] = [];

    for (const review of allReviews || []) {
      // Check if review is claimed by current user
      const isActuallyClaimed = review.customer_id === currentUser.id;
      
      console.log('=== PROCESSING REVIEW ===', {
        reviewId: review.id,
        originalDbCustomerId: review.customer_id,
        currentUserId: currentUser.id,
        isActuallyClaimed,
        customerName: review.customer_name
      });

      // Skip reviews claimed by other users
      if (review.customer_id && review.customer_id !== currentUser.id) {
        console.log('Skipping review claimed by another user:', review.id);
        continue;
      }

      // Get business profile data for this review
      const businessProfile = businessProfilesMap.get(review.business_id);
      const isVerified = businessVerificationMap.get(review.business_id) || false;

      // If review is actually claimed by this user, mark as 'claimed'
      if (isActuallyClaimed) {
        console.log('Review is ACTUALLY CLAIMED by current user:', review.id);
        reviewMatches.push({
          review: {
            ...review,
            customerId: review.customer_id,
            business_profile: businessProfile,
            reviewerVerified: isVerified
          },
          matchType: 'claimed',
          matchScore: 100,
          matchReasons: ['Already claimed by you'],
          detailedMatches: []
        });
        continue;
      }

      // Only calculate match scores for UNCLAIMED reviews
      console.log('Calculating match score for UNCLAIMED review:', review.id);
      const { score, reasons, detailedMatches } = checkReviewMatch(review, userProfile);

      console.log('MATCH CALCULATION RESULT:', {
        reviewId: review.id,
        customerName: review.customer_name,
        matchScore: score,
        reasons,
        originalCustomerId: review.customer_id
      });

      if (score >= 40) {
        // High quality match
        const isNew = new Date(review.created_at) > new Date(lastLoginTime);
        reviewMatches.push({
          review: {
            ...review,
            isNewReview: isNew,
            customerId: null, // Explicitly set to null for unclaimed reviews
            business_profile: businessProfile,
            reviewerVerified: isVerified
          },
          matchType: 'high_quality',
          matchScore: score,
          matchReasons: reasons,
          detailedMatches
        });
      } else if (score >= 15) {
        // Potential match
        const isNew = new Date(review.created_at) > new Date(lastLoginTime);
        reviewMatches.push({
          review: {
            ...review,
            isNewReview: isNew,
            customerId: null, // Explicitly set to null for unclaimed reviews
            business_profile: businessProfile,
            reviewerVerified: isVerified
          },
          matchType: 'potential',
          matchScore: score,
          matchReasons: reasons,
          detailedMatches
        });
      }
    }

    console.log("=== FINAL REVIEW MATCHES ===", {
      total: reviewMatches.length,
      claimed: reviewMatches.filter(m => m.matchType === 'claimed').length,
      highQuality: reviewMatches.filter(m => m.matchType === 'high_quality').length,
      potential: reviewMatches.filter(m => m.matchType === 'potential').length
    });
    
    return reviewMatches;
  };

  return {
    categorizeReviews
  };
};
