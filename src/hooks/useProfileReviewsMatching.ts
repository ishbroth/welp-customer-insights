
import { supabase } from "@/integrations/supabase/client";

interface MatchingCriteria {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface ReviewMatch {
  review: any;
  matchType: 'claimed' | 'high_quality' | 'potential';
  matchScore: number;
  matchReasons: string[];
}

export const useProfileReviewsMatching = () => {
  const calculateMatchScore = (review: any, userProfile: any): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    // Get user's full name
    const userFullName = userProfile?.name || 
      `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim();

    // Name matching (highest priority)
    if (review.customer_name && userFullName) {
      const reviewName = review.customer_name.toLowerCase().trim();
      const userName = userFullName.toLowerCase().trim();
      
      if (reviewName === userName) {
        score += 40;
        reasons.push('Exact name match');
      } else if (reviewName.includes(userName) || userName.includes(reviewName)) {
        score += 25;
        reasons.push('Partial name match');
      }
    }

    // Phone matching (very high priority)
    if (review.customer_phone && userProfile?.phone) {
      const reviewPhone = review.customer_phone.replace(/\D/g, '');
      const userPhone = userProfile.phone.replace(/\D/g, '');
      
      if (reviewPhone && userPhone && reviewPhone === userPhone) {
        score += 35;
        reasons.push('Phone number match');
      }
    }

    // Address matching
    if (review.customer_address && userProfile?.address) {
      const reviewAddress = review.customer_address.toLowerCase().trim();
      const userAddress = userProfile.address.toLowerCase().trim();
      
      if (reviewAddress === userAddress) {
        score += 20;
        reasons.push('Address match');
      } else if (reviewAddress.includes(userAddress) || userAddress.includes(reviewAddress)) {
        score += 10;
        reasons.push('Partial address match');
      }
    }

    // City matching
    if (review.customer_city && userProfile?.city) {
      const reviewCity = review.customer_city.toLowerCase().trim();
      const userCity = userProfile.city.toLowerCase().trim();
      
      if (reviewCity === userCity) {
        score += 10;
        reasons.push('City match');
      }
    }

    // State matching
    if (review.customer_zipcode && userProfile?.zipcode) {
      if (review.customer_zipcode === userProfile.zipcode) {
        score += 10;
        reasons.push('ZIP code match');
      }
    }

    return { score, reasons };
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

    // Fetch all potential matching reviews
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    const reviewMatches: ReviewMatch[] = [];

    for (const review of allReviews || []) {
      // Skip if review is claimed by someone else
      if (review.claimed_by && review.claimed_by !== currentUser.id) {
        continue;
      }

      // If already claimed by current user, mark as claimed
      if (review.customer_id === currentUser.id || review.claimed_by === currentUser.id) {
        reviewMatches.push({
          review,
          matchType: 'claimed',
          matchScore: 100,
          matchReasons: ['Already claimed by you']
        });
        continue;
      }

      // Calculate match score for unclaimed reviews
      const { score, reasons } = calculateMatchScore(review, userProfile);

      if (score >= 40) {
        // High quality match (name + phone, or name + address)
        const isNew = new Date(review.created_at) > new Date(lastLoginTime);
        reviewMatches.push({
          review: {
            ...review,
            isNewReview: isNew
          },
          matchType: 'high_quality',
          matchScore: score,
          matchReasons: reasons
        });
      } else if (score >= 15) {
        // Potential match (partial matches)
        const isNew = new Date(review.created_at) > new Date(lastLoginTime);
        reviewMatches.push({
          review: {
            ...review,
            isNewReview: isNew
          },
          matchType: 'potential',
          matchScore: score,
          matchReasons: reasons
        });
      }
    }

    console.log("Review matches found:", reviewMatches.length);
    return reviewMatches;
  };

  return {
    categorizeReviews
  };
};
