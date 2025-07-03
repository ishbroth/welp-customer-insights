
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

    // CRITICAL: Fetch all reviews and check their ACTUAL claim status from database
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
      console.log(`🔍 REVIEW DEBUG: ${review.id}`, {
        customer_name: review.customer_name,
        database_customer_id: review.customer_id,
        current_user_id: currentUser.id,
        is_actually_claimed_by_current_user: review.customer_id === currentUser.id,
        is_claimed_by_someone_else: review.customer_id && review.customer_id !== currentUser.id,
        business_id: review.business_id,
        claimed_at: review.claimed_at
      });
    });

    // Get business profiles and verification status for all reviews
    const { businessProfilesMap, businessVerificationMap } = await fetchBusinessProfiles(allReviews || []);

    const reviewMatches: any[] = [];

    for (const review of allReviews || []) {
      // CRITICAL: Determine the ACTUAL claim status ONLY from database customer_id field
      const isActuallyClaimedByCurrentUser = review.customer_id === currentUser.id;
      const isClaimedBySomeoneElse = review.customer_id && review.customer_id !== currentUser.id;
      
      console.log('=== PROCESSING REVIEW ===', {
        reviewId: review.id,
        customer_name: review.customer_name,
        database_customer_id: review.customer_id,
        current_user_id: currentUser.id,
        isActuallyClaimedByCurrentUser,
        isClaimedBySomeoneElse,
        shouldSkip: isClaimedBySomeoneElse
      });

      // Skip reviews claimed by other users
      if (isClaimedBySomeoneElse) {
        console.log('❌ SKIPPING: Review claimed by another user:', review.id);
        continue;
      }

      // Get business profile data for this review
      const businessProfile = businessProfilesMap.get(review.business_id);
      const isVerified = businessVerificationMap.get(review.business_id) || false;

      console.log('🏢 BUSINESS VERIFICATION DEBUG:', {
        businessId: review.business_id,
        profileFound: !!businessProfile,
        businessName: businessProfile?.name,
        verificationFromMap: businessVerificationMap.get(review.business_id),
        finalVerificationStatus: isVerified,
        businessProfileVerified: businessProfile?.verified
      });

      // CRITICAL FIX: If review is actually claimed by this user, mark as 'claimed'
      if (isActuallyClaimedByCurrentUser) {
        console.log('✅ CLAIMED: Review is actually claimed by current user:', review.id);
        reviewMatches.push({
          review: {
            ...review,
            customerId: review.customer_id, // Keep the actual customer_id from database
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

      // CRITICAL FIX: For UNCLAIMED reviews, calculate match score but NEVER auto-claim
      console.log('🔍 MATCHING: Calculating match score for unclaimed review:', review.id);
      const { score, reasons, detailedMatches } = checkReviewMatch(review, userProfile);

      console.log('📊 MATCH RESULT:', {
        reviewId: review.id,
        customerName: review.customer_name,
        matchScore: score,
        reasons,
        willBeIncluded: score >= 40,
        IMPORTANT_never_auto_claim: 'This review will remain unclaimed regardless of match score'
      });

      if (score >= 40) {
        // High quality match - but NEVER auto-claim, always leave unclaimed
        const isNew = new Date(review.created_at) > new Date(lastLoginTime);
        const matchType = score >= 70 ? 'high_quality' : 'potential';
        
        console.log('✨ UNCLAIMED MATCH FOUND:', {
          reviewId: review.id,
          matchType,
          score,
          isNew,
          CRITICAL_customerId_must_be_null: null,
          businessVerified: isVerified,
          requiresManualClaim: true
        });
        
        reviewMatches.push({
          review: {
            ...review,
            isNewReview: isNew,
            customerId: null, // CRITICAL: Always null for unclaimed reviews
            business_profile: businessProfile,
            reviewerVerified: isVerified,
            reviewerName: businessProfile?.name || 'Business',
            reviewerAvatar: businessProfile?.avatar || ''
          },
          matchType,
          matchScore: score,
          matchReasons: reasons,
          detailedMatches,
          isClaimed: false // CRITICAL: Explicitly false for unclaimed
        });
      } else {
        console.log('❌ NO MATCH: Score too low:', score, 'for review:', review.id);
      }
    }

    console.log("=== FINAL REVIEW MATCHES ===", {
      total: reviewMatches.length,
      claimed: reviewMatches.filter(m => m.matchType === 'claimed').length,
      highQuality: reviewMatches.filter(m => m.matchType === 'high_quality').length,
      potential: reviewMatches.filter(m => m.matchType === 'potential').length,
      CRITICAL_NOTE: 'NO reviews are auto-claimed - all unclaimed reviews require manual claim button'
    });
    
    // Log each match with critical fields for debugging
    reviewMatches.forEach(match => {
      console.log(`📋 FINAL MATCH: ${match.review.id}`, {
        matchType: match.matchType,
        score: match.matchScore,
        isClaimed: match.isClaimed,
        customerId: match.review.customerId,
        businessName: match.review.reviewerName,
        businessVerified: match.review.reviewerVerified,
        shouldShowClaimButton: match.matchType !== 'claimed',
        shouldShowResponses: match.matchType === 'claimed',
        CRITICAL_auto_claim_disabled: match.matchType !== 'claimed' ? 'User must manually claim' : 'Already claimed'
      });
    });
    
    return reviewMatches;
  };

  return {
    categorizeReviews
  };
};
