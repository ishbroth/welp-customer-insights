
import { supabase } from "@/integrations/supabase/client";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

interface ReviewMatch {
  review: any;
  matchType: 'claimed' | 'high_quality' | 'potential';
  matchScore: number;
  matchReasons: string[];
}

export const useProfileReviewsMatching = () => {
  const categorizeReviews = async (currentUser: any): Promise<ReviewMatch[]> => {
    if (!currentUser || currentUser.type !== "customer") {
      return [];
    }

    console.log("=== CATEGORIZING REVIEWS FOR CUSTOMER ===");
    console.log("User:", currentUser.name, currentUser.id);

    // 1. Get already claimed reviews (direct customer_id match)
    const { data: claimedReviews, error: claimedError } = await supabase
      .from('reviews')
      .select(`
        id, rating, content, created_at, business_id,
        customer_name, customer_address, customer_city, 
        customer_zipcode, customer_phone
      `)
      .eq('customer_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (claimedError) {
      console.error("Error fetching claimed reviews:", claimedError);
      return [];
    }

    // 2. Get all other reviews for potential matching
    const { data: allReviews, error: allError } = await supabase
      .from('reviews')
      .select(`
        id, rating, content, created_at, business_id,
        customer_name, customer_address, customer_city, 
        customer_zipcode, customer_phone
      `)
      .is('customer_id', null)  // Only unclaimed reviews
      .order('created_at', { ascending: false });

    if (allError) {
      console.error("Error fetching all reviews:", allError);
      return [];
    }

    const reviewMatches: ReviewMatch[] = [];

    // Add claimed reviews first
    (claimedReviews || []).forEach(review => {
      reviewMatches.push({
        review,
        matchType: 'claimed',
        matchScore: 100,
        matchReasons: ['Already claimed by you']
      });
    });

    // Analyze unclaimed reviews for potential matches
    (allReviews || []).forEach(review => {
      const matchResult = analyzeReviewMatch(review, currentUser);
      if (matchResult.matchScore > 20) { // Only include reasonable matches
        reviewMatches.push(matchResult);
      }
    });

    console.log(`Found ${reviewMatches.length} total review matches`);
    return reviewMatches;
  };

  const analyzeReviewMatch = (review: any, currentUser: any): ReviewMatch => {
    let score = 0;
    const reasons: string[] = [];

    // Get user's full name
    const userFullName = currentUser.name || 
      `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();

    // Name matching
    if (review.customer_name && userFullName) {
      const nameSimilarity = calculateStringSimilarity(
        review.customer_name.toLowerCase(), 
        userFullName.toLowerCase()
      );
      
      if (nameSimilarity > 0.8) {
        score += 40;
        reasons.push('Strong name match');
      } else if (nameSimilarity > 0.6) {
        score += 25;
        reasons.push('Good name match');
      } else if (nameSimilarity > 0.4) {
        score += 15;
        reasons.push('Possible name match');
      }

      // Check for exact word matches in names
      const reviewNameWords = review.customer_name.toLowerCase().split(' ');
      const userNameWords = userFullName.toLowerCase().split(' ');
      
      let wordMatches = 0;
      reviewNameWords.forEach(word => {
        if (userNameWords.includes(word) && word.length > 2) {
          wordMatches++;
        }
      });
      
      if (wordMatches > 0) {
        score += wordMatches * 10;
        reasons.push(`${wordMatches} name word(s) match`);
      }
    }

    // Phone matching
    if (review.customer_phone && currentUser.phone) {
      const reviewPhone = review.customer_phone.replace(/\D/g, '');
      const userPhone = currentUser.phone.replace(/\D/g, '');
      
      if (reviewPhone === userPhone) {
        score += 35;
        reasons.push('Exact phone match');
      } else if (reviewPhone.length >= 7 && userPhone.length >= 7) {
        const reviewLast7 = reviewPhone.slice(-7);
        const userLast7 = userPhone.slice(-7);
        if (reviewLast7 === userLast7) {
          score += 25;
          reasons.push('Phone number match (last 7 digits)');
        }
      }
    }

    // Address matching
    if (review.customer_address && currentUser.address) {
      const addressSimilarity = calculateStringSimilarity(
        review.customer_address.toLowerCase(),
        currentUser.address.toLowerCase()
      );
      
      if (addressSimilarity > 0.7) {
        score += 25;
        reasons.push('Strong address match');
      } else if (addressSimilarity > 0.5) {
        score += 15;
        reasons.push('Good address match');
      }

      // Check for house number match
      const reviewHouseNum = review.customer_address.match(/^\d+/);
      const userHouseNum = currentUser.address.match(/^\d+/);
      
      if (reviewHouseNum && userHouseNum && reviewHouseNum[0] === userHouseNum[0]) {
        score += 10;
        reasons.push('Same house number');
      }
    }

    // City matching
    if (review.customer_city && currentUser.city) {
      const citySimilarity = calculateStringSimilarity(
        review.customer_city.toLowerCase(),
        currentUser.city.toLowerCase()
      );
      
      if (citySimilarity > 0.8) {
        score += 15;
        reasons.push('City match');
      }
    }

    // Zip code matching
    if (review.customer_zipcode && currentUser.zipcode) {
      const reviewZip = review.customer_zipcode.replace(/\D/g, '');
      const userZip = currentUser.zipcode.replace(/\D/g, '');
      
      if (reviewZip === userZip) {
        score += 15;
        reasons.push('Zip code match');
      } else if (reviewZip.slice(0, 5) === userZip.slice(0, 5)) {
        score += 10;
        reasons.push('Zip code area match');
      }
    }

    // Determine match type based on score
    let matchType: 'high_quality' | 'potential' = 'potential';
    if (score >= 60) {
      matchType = 'high_quality';
    }

    return {
      review,
      matchType,
      matchScore: score,
      matchReasons: reasons
    };
  };

  return { categorizeReviews };
};
