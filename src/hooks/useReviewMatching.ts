
import { compareAddresses } from "@/utils/addressNormalization";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

interface DetailedMatch {
  field: string;
  reviewValue: string;
  searchValue: string;
  similarity: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

interface MatchResult {
  score: number;
  reasons: string[];
  detailedMatches: DetailedMatch[];
}

export const useReviewMatching = () => {
  const checkReviewMatch = (review: any, userProfile: any): MatchResult => {
    let score = 0;
    const reasons: string[] = [];
    const detailedMatches: DetailedMatch[] = [];

    // Get user's full name
    const userFullName = userProfile?.name || 
      `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim();

    console.log('🎯 checkReviewMatch: Checking match for:', {
      reviewId: review.id,
      reviewCustomerName: review.customer_name,
      userFullName,
      userProfile: userProfile?.name || 'constructed name'
    });

    // Name matching with fuzzy logic (INCREASED PRIORITY - was 40, now 50 for exact matches)
    if (review.customer_name && userFullName) {
      const similarity = calculateStringSimilarity(review.customer_name, userFullName);
      
      console.log('🎯 Name similarity check:', {
        reviewName: review.customer_name,
        userName: userFullName,
        similarity: similarity,
        isExactMatch: similarity >= 0.9
      });
      
      if (similarity >= 0.9) {
        score += 50; // INCREASED from 40 to 50 to ensure exact matches qualify
        reasons.push('Exact name match');
        detailedMatches.push({
          field: 'Name',
          reviewValue: review.customer_name,
          searchValue: userFullName,
          similarity,
          matchType: 'exact'
        });
      } else if (similarity >= 0.7) {
        score += 30; // INCREASED from 25 to 30 for partial matches
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

    const percentageScore = Math.min(100, Math.round(score));
    
    console.log('🎯 Final match result:', {
      reviewId: review.id,
      score: percentageScore,
      reasons,
      detailedMatches: detailedMatches.length
    });
    
    return { score: percentageScore, reasons, detailedMatches };
  };

  return { checkReviewMatch };
};
