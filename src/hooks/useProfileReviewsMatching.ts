
import { supabase } from "@/integrations/supabase/client";
import { useReviewMatching } from "./useReviewMatching";
import { useBusinessProfileFetching } from "./useBusinessProfileFetching";

export const useProfileReviewsMatching = () => {
  const { checkReviewMatch } = useReviewMatching();
  const { fetchBusinessProfiles } = useBusinessProfileFetching();

  const categorizeReviews = async (currentUser: any) => {
    console.log("=== CATEGORIZING REVIEWS FOR USER ===");
    console.log("User ID:", currentUser.id);
    console.log("User name:", currentUser.name);

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
        business_id: review.business_id,
        claimed_at: review.claimed_at,
        is_actually_claimed: !!review.customer_id
      });
    });

    // Get business profiles and verification status for all reviews
    const { businessProfilesMap, businessVerificationMap } = await fetchBusinessProfiles(allReviews || []);

    const reviewMatches: any[] = [];

    for (const review of allReviews || []) {
      // CRITICAL: Check if review is ACTUALLY claimed by current user in database
      const isActuallyClaimed = review.customer_id === currentUser.id;
      
      console.log('=== PROCESSING REVIEW ===', {
        reviewId: review.id,
        customer_name: review.customer_name,
        originalDbCustomerId: review.customer_id,
        currentUserId: currentUser.id,
        isActuallyClaimed,
        claimed_at: review.claimed_at
      });

      // Skip reviews claimed by other users
      if (review.customer_id && review.customer_id !== currentUser.id) {
        console.log('❌ SKIPPING: Review claimed by another user:', review.id);
        continue;
      }

      // Get business profile data for this review
      const businessProfile = businessProfilesMap.get(review.business_id);
      const isVerified = businessVerificationMap.get(review.business_id) || false;

      console.log('🏢 BUSINESS DATA:', {
        businessId: review.business_id,
        profileFound: !!businessProfile,
        businessName: businessProfile?.name,
        isVerified,
        verificationFromMap: businessVerificationMap.get(review.business_id)
      });

      // If review is actually claimed by this user, mark as 'claimed'
      if (isActuallyClaimed) {
        console.log('✅ CLAIMED: Review is actually claimed by current user:', review.id);
        reviewMatches.push({
          review: {
            ...review,
            customerId: review.customer_id, // Keep the actual customer_id
            business_profile: businessProfile,
            reviewerVerified: isVerified,
            reviewerName: businessProfile?.name || 'Business',
            reviewerAvatar: businessProfile?.avatar || ''
          },
          matchType: 'claimed',
          matchScore: 100,
          matchReasons: ['Already claimed by you'],
          detailedMatches: [],
          isClaimed: true
        });
        continue;
      }

      // For UNCLAIMED reviews, calculate match scores
      console.log('🔍 MATCHING: Calculating match score for unclaimed review:', review.id);
      const { score, reasons, detailedMatches } = checkReviewMatch(review, userProfile);

      console.log('📊 MATCH RESULT:', {
        reviewId: review.id,
        customerName: review.customer_name,
        matchScore: score,
        reasons,
        willBeIncluded: score >= 40
      });

      if (score >= 40) {
        // High quality match - but NOT claimed
        const isNew = new Date(review.created_at) > new Date(lastLoginTime);
        const matchType = score >= 70 ? 'high_quality' : 'potential';
        
        console.log('✨ MATCH FOUND:', {
          reviewId: review.id,
          matchType,
          score,
          isNew,
          isActuallyClaimed: false
        });
        
        reviewMatches.push({
          review: {
            ...review,
            isNewReview: isNew,
            customerId: null, // CRITICAL: Explicitly set to null for unclaimed reviews
            business_profile: businessProfile,
            reviewerVerified: isVerified,
            reviewerName: businessProfile?.name || 'Business',
            reviewerAvatar: businessProfile?.avatar || ''
          },
          matchType,
          matchScore: score,
          matchReasons: reasons,
          detailedMatches,
          isClaimed: false // CRITICAL: Explicitly set to false
        });
      } else {
        console.log('❌ NO MATCH: Score too low:', score, 'for review:', review.id);
      }
    }

    console.log("=== FINAL REVIEW MATCHES ===", {
      total: reviewMatches.length,
      claimed: reviewMatches.filter(m => m.matchType === 'claimed').length,
      highQuality: reviewMatches.filter(m => m.matchType === 'high_quality').length,
      potential: reviewMatches.filter(m => m.matchType === 'potential').length
    });
    
    // Log each match for debugging
    reviewMatches.forEach(match => {
      console.log(`📋 MATCH SUMMARY: ${match.review.id}`, {
        matchType: match.matchType,
        score: match.matchScore,
        isClaimed: match.isClaimed,
        customerId: match.review.customerId,
        businessName: match.review.reviewerName,
        businessVerified: match.review.reviewerVerified
      });
    });
    
    return reviewMatches;
  };

  return {
    categorizeReviews
  };
};
