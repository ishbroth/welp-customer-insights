
import { supabase } from "@/integrations/supabase/client";
import { compareAddresses } from "@/utils/addressNormalization";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

interface MatchingCriteria {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface DetailedMatch {
  field: string;
  reviewValue: string;
  searchValue: string;
  similarity: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

interface ReviewMatch {
  review: any;
  matchType: 'claimed' | 'high_quality' | 'potential';
  matchScore: number;
  matchReasons: string[];
  detailedMatches: DetailedMatch[];
}

export const useProfileReviewsMatching = () => {
  const calculateMatchScore = (review: any, userProfile: any): { 
    score: number; 
    reasons: string[]; 
    detailedMatches: DetailedMatch[] 
  } => {
    let score = 0;
    const reasons: string[] = [];
    const detailedMatches: DetailedMatch[] = [];

    // Get user's full name
    const userFullName = userProfile?.name || 
      `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim();

    // Name matching with fuzzy logic (highest priority)
    if (review.customer_name && userFullName) {
      const similarity = calculateStringSimilarity(review.customer_name, userFullName);
      
      if (similarity >= 0.9) {
        score += 40;
        reasons.push('Exact name match');
        detailedMatches.push({
          field: 'Name',
          reviewValue: review.customer_name,
          searchValue: userFullName,
          similarity,
          matchType: 'exact'
        });
      } else if (similarity >= 0.7) {
        score += 25;
        reasons.push('Partial name match');
        detailedMatches.push({
          field: 'Name',
          reviewValue: review.customer_name,
          searchValue: userFullName,
          similarity,
          matchType: 'partial'
        });
      }
    }

    // Phone matching (very high priority)
    if (review.customer_phone && userProfile?.phone) {
      const reviewPhone = review.customer_phone.replace(/\D/g, '');
      const userPhone = userProfile.phone.replace(/\D/g, '');
      
      if (reviewPhone && userPhone && reviewPhone === userPhone) {
        score += 35;
        reasons.push('Phone number match');
        detailedMatches.push({
          field: 'Phone',
          reviewValue: review.customer_phone,
          searchValue: userProfile.phone,
          similarity: 1.0,
          matchType: 'exact'
        });
      }
    }

    // Address matching with fuzzy logic
    if (review.customer_address && userProfile?.address) {
      if (compareAddresses(review.customer_address, userProfile.address, 0.9)) {
        score += 20;
        reasons.push('Address match');
        detailedMatches.push({
          field: 'Address',
          reviewValue: review.customer_address,
          searchValue: userProfile.address,
          similarity: 0.9,
          matchType: 'exact'
        });
      } else if (compareAddresses(review.customer_address, userProfile.address, 0.7)) {
        score += 10;
        reasons.push('Partial address match');
        detailedMatches.push({
          field: 'Address',
          reviewValue: review.customer_address,
          searchValue: userProfile.address,
          similarity: 0.7,
          matchType: 'partial'
        });
      }
    }

    // City matching with fuzzy logic
    if (review.customer_city && userProfile?.city) {
      const similarity = calculateStringSimilarity(review.customer_city, userProfile.city);
      if (similarity >= 0.8) {
        score += 10;
        reasons.push('City match');
        detailedMatches.push({
          field: 'City',
          reviewValue: review.customer_city,
          searchValue: userProfile.city,
          similarity,
          matchType: similarity >= 0.9 ? 'exact' : 'partial'
        });
      }
    }

    // ZIP code matching
    if (review.customer_zipcode && userProfile?.zipcode) {
      if (review.customer_zipcode === userProfile.zipcode) {
        score += 10;
        reasons.push('ZIP code match');
        detailedMatches.push({
          field: 'ZIP Code',
          reviewValue: review.customer_zipcode,
          searchValue: userProfile.zipcode,
          similarity: 1.0,
          matchType: 'exact'
        });
      }
    }

    // Calculate percentage score (max possible is 40+35+20+10+10 = 115, but cap at 100)
    const percentageScore = Math.min(100, Math.round(score));

    return { score: percentageScore, reasons, detailedMatches };
  };

  const categorizeReviews = async (currentUser: any): Promise<ReviewMatch[]> => {
    console.log("=== CATEGORIZING REVIEWS FOR USER ===");
    console.log("User ID:", currentUser.id);

    // First get user's current profile data
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

    // FIXED: Fetch all potential matching reviews AND exclude soft-deleted reviews
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
      .is('deleted_at', null) // Only get non-deleted reviews
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    const reviewMatches: ReviewMatch[] = [];

    for (const review of allReviews || []) {
      // FIXED: Use actual database customer_id to determine claim status
      const isActuallyClaimed = review.customer_id === currentUser.id;
      
      console.log('Review claim analysis:', {
        reviewId: review.id,
        dbCustomerId: review.customer_id,
        currentUserId: currentUser.id,
        isActuallyClaimed,
        claimedBy: review.claimed_by
      });

      // Skip reviews claimed by other users
      if (review.customer_id && review.customer_id !== currentUser.id) {
        console.log('Skipping review claimed by another user:', review.id);
        continue;
      }

      // FIXED: Only mark as 'claimed' if actually claimed in database
      if (isActuallyClaimed) {
        reviewMatches.push({
          review: {
            ...review,
            customerId: review.customer_id, // Ensure customerId is set for claimed reviews
          },
          matchType: 'claimed',
          matchScore: 100,
          matchReasons: ['Already claimed by you'],
          detailedMatches: []
        });
        continue;
      }

      // Calculate match score for unclaimed reviews
      const { score, reasons, detailedMatches } = calculateMatchScore(review, userProfile);

      if (score >= 40) {
        // High quality match (name + phone, or name + address)
        const isNew = new Date(review.created_at) > new Date(lastLoginTime);
        reviewMatches.push({
          review: {
            ...review,
            isNewReview: isNew,
            customerId: null // Explicitly set to null for unclaimed reviews
          },
          matchType: 'high_quality',
          matchScore: score,
          matchReasons: reasons,
          detailedMatches
        });
      } else if (score >= 15) {
        // Potential match (partial matches)
        const isNew = new Date(review.created_at) > new Date(lastLoginTime);
        reviewMatches.push({
          review: {
            ...review,
            isNewReview: isNew,
            customerId: null // Explicitly set to null for unclaimed reviews
          },
          matchType: 'potential',
          matchScore: score,
          matchReasons: reasons,
          detailedMatches
        });
      }
    }

    console.log("Review matches found:", reviewMatches.length);
    console.log("Review matches breakdown:", {
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
