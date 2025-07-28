
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

    console.log('🔍 DETAILED MATCH CHECK:', {
      reviewId: review.id,
      reviewCustomerName: review.customer_name,
      reviewCustomerPhone: review.customer_phone,
      reviewCustomerAddress: review.customer_address,
      reviewCustomerCity: review.customer_city,
      reviewCustomerZipcode: review.customer_zipcode,
      userFullName,
      userPhone: userProfile?.phone,
      userAddress: userProfile?.address,
      userCity: userProfile?.city,
      userZipcode: userProfile?.zipcode
    });

    // Name matching with fuzzy logic (INCREASED PRIORITY)
    if (review.customer_name && userFullName) {
      const similarity = calculateStringSimilarity(review.customer_name, userFullName);
      
      console.log('📝 NAME SIMILARITY:', {
        reviewName: review.customer_name,
        userName: userFullName,
        similarity: similarity,
        isExactMatch: similarity >= 0.9,
        isPartialMatch: similarity >= 0.7
      });
      
      if (similarity >= 0.9) {
        score += 50;
        reasons.push('Exact name match');
        detailedMatches.push({
          field: 'Name',
          reviewValue: review.customer_name,
          searchValue: userFullName,
          similarity,
          matchType: 'exact'
        });
        console.log('✅ EXACT NAME MATCH - Added 50 points');
      } else if (similarity >= 0.7) {
        score += 30;
        reasons.push('Partial name match');
        detailedMatches.push({
          field: 'Name',
          reviewValue: review.customer_name,
          searchValue: userFullName,
          similarity,
          matchType: 'partial'
        });
        console.log('✅ PARTIAL NAME MATCH - Added 30 points');
      } else {
        console.log('❌ NAME SIMILARITY TOO LOW:', similarity);
      }
    } else {
      console.log('❌ MISSING NAME DATA:', {
        reviewName: review.customer_name,
        userName: userFullName
      });
    }

    // Phone matching (very high priority)
    if (review.customer_phone && userProfile?.phone) {
      const reviewPhone = review.customer_phone.replace(/\D/g, '');
      const userPhone = userProfile.phone.replace(/\D/g, '');
      
      console.log('📞 PHONE COMPARISON:', {
        reviewPhone,
        userPhone,
        match: reviewPhone === userPhone
      });
      
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
        console.log('✅ PHONE MATCH - Added 35 points');
      } else {
        console.log('❌ PHONE NO MATCH');
      }
    } else {
      console.log('❌ MISSING PHONE DATA:', {
        reviewPhone: review.customer_phone,
        userPhone: userProfile?.phone
      });
    }

    // Address matching with fuzzy logic
    if (review.customer_address && userProfile?.address) {
      console.log('🏠 ADDRESS COMPARISON:', {
        reviewAddress: review.customer_address,
        userAddress: userProfile.address
      });
      
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
        console.log('✅ EXACT ADDRESS MATCH - Added 20 points');
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
        console.log('✅ PARTIAL ADDRESS MATCH - Added 10 points');
      } else {
        console.log('❌ ADDRESS NO MATCH');
      }
    } else {
      console.log('❌ MISSING ADDRESS DATA');
    }

    // City matching with fuzzy logic
    if (review.customer_city && userProfile?.city) {
      const similarity = calculateStringSimilarity(review.customer_city, userProfile.city);
      console.log('🏙️ CITY COMPARISON:', {
        reviewCity: review.customer_city,
        userCity: userProfile.city,
        similarity
      });
      
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
        console.log('✅ CITY MATCH - Added 10 points');
      } else {
        console.log('❌ CITY NO MATCH');
      }
    } else {
      console.log('❌ MISSING CITY DATA');
    }

    // ZIP code matching
    if (review.customer_zipcode && userProfile?.zipcode) {
      console.log('📮 ZIP COMPARISON:', {
        reviewZip: review.customer_zipcode,
        userZip: userProfile.zipcode,
        match: review.customer_zipcode === userProfile.zipcode
      });
      
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
        console.log('✅ ZIP MATCH - Added 10 points');
      } else {
        console.log('❌ ZIP NO MATCH');
      }
    } else {
      console.log('❌ MISSING ZIP DATA');
    }

    const percentageScore = Math.min(100, Math.round(score));
    
    console.log('🎯 FINAL MATCH RESULT:', {
      reviewId: review.id,
      totalScore: percentageScore,
      reasons,
      detailedMatches: detailedMatches.length,
      willMatch: percentageScore >= 50,
      matchType: percentageScore >= 80 ? 'high_quality' : percentageScore >= 50 ? 'potential' : 'none'
    });
    
    return { score: percentageScore, reasons, detailedMatches };
  };

  return { checkReviewMatch };
};
