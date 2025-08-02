import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchBusinessProfile } from "@/services/businessProfileService";
import { formatReview } from "@/utils/reviewFormatter";
import { supabase } from "@/integrations/supabase/client";

import { Customer } from "@/types/search";
import { compareAddresses } from "@/utils/addressNormalization";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

interface ReviewMatchData {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_zipcode?: string;
}

interface MatchResult {
  matchType: 'claimed' | 'high_quality' | 'potential' | 'none';
  matchScore: number;
  matchReasons: string[];
}

const checkReviewMatch = (review: ReviewMatchData, currentUser: any): MatchResult => {
  let matchScore = 0;
  const matchReasons: string[] = [];

  // Check name match with fuzzy logic
  if (review.customer_name && currentUser.name) {
    const similarity = calculateStringSimilarity(review.customer_name, currentUser.name);
    if (similarity >= 0.8) {
      matchScore += 40;
      matchReasons.push('Name match');
    }
  }

  // Check phone match (remove non-digits for comparison)
  if (review.customer_phone && currentUser.phone) {
    const reviewPhone = review.customer_phone.replace(/\D/g, '');
    const userPhone = currentUser.phone.replace(/\D/g, '');
    if (reviewPhone && userPhone && reviewPhone === userPhone) {
      matchScore += 30;
      matchReasons.push('Phone match');
    }
  }

  // Check address match using fuzzy comparison
  if (review.customer_address && currentUser.address) {
    if (compareAddresses(review.customer_address, currentUser.address, 0.8)) {
      matchScore += 30;
      matchReasons.push('Address match');
    }
  }

  let matchType: 'claimed' | 'high_quality' | 'potential' | 'none' = 'none';
  if (matchScore >= 70) {
    matchType = 'high_quality';
  } else if (matchScore >= 30) {
    matchType = 'potential';
  }

  return { matchType, matchScore, matchReasons };
};

export const useProfileReviewsMatching = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const categorizeReviews = async (currentUser: any) => {
    
    try {
      // First, get all globally claimed reviews to exclude from matching
      const { data: globalClaims, error: claimsError } = await supabase
        .from('review_claims')
        .select('review_id');

      if (claimsError) {
        return [];
      }

      const globallyClaimedReviewIds = globalClaims?.map(claim => claim.review_id) || [];

      // Get unclaimed reviews only (exclude ALL globally claimed reviews)
      let query = supabase
        .from('reviews')
        .select(`
          id,
          customer_name,
          customer_address,
          customer_city,
          customer_zipcode,
          customer_phone,
          rating,
          content,
          created_at,
          business_id,
          
          profiles!business_id(id, name, avatar, verified)
        `)
        .order('created_at', { ascending: false });

      // Exclude globally claimed reviews at database level
      if (globallyClaimedReviewIds.length > 0) {
        query = query.not('id', 'in', `(${globallyClaimedReviewIds.map(id => `"${id}"`).join(',')})`);
      }

      const { data: allReviews, error } = await query;

      if (error) {
        return [];
      }

      if (!allReviews || allReviews.length === 0) {
        return [];
      }

      // Process each review and categorize based on match quality
      const categorizedReviews = allReviews.map(review => {
        const isDirectlyClaimed = false; // Reviews don't have customer_id yet
        
        if (isDirectlyClaimed) {
          return {
            review: {
              ...review,
              business_profile: review.profiles,
              reviewerName: review.profiles?.name || 'Business',
              reviewerAvatar: review.profiles?.avatar || '',
              reviewerVerified: review.profiles?.verified || false,
              customerId: null // Reviews don't have customer_id yet
            },
            matchType: 'claimed' as const,
            matchScore: 100,
            matchReasons: ['Review is claimed by your account'],
            isClaimed: true
          };
        }

        // Check for potential matches using existing logic
        const matchResult = checkReviewMatch(review, currentUser);
        
        return {
          review: {
            ...review,
            business_profile: review.profiles,
            reviewerName: review.profiles?.name || 'Business', 
            reviewerAvatar: review.profiles?.avatar || '',
            reviewerVerified: review.profiles?.verified || false,
            customerId: null // Reviews don't have customer_id yet
          },
          matchType: matchResult.matchType,
          matchScore: matchResult.matchScore,
          matchReasons: matchResult.matchReasons,
          isClaimed: false
        };
      });

      // Filter out low-quality matches (globally claimed reviews already excluded at DB level)
      const filteredReviews = categorizedReviews
        .filter(item => {
          // Keep high-quality matches and potential matches above threshold
          // No 'claimed' type here since we only fetch unclaimed reviews
          return item.matchType === 'high_quality' || 
                 (item.matchType === 'potential' && item.matchScore > 30);
        })
        .sort((a, b) => {
          // Claimed reviews first
          if (a.matchType === 'claimed' && b.matchType !== 'claimed') return -1;
          if (a.matchType !== 'claimed' && b.matchType === 'claimed') return 1;
          
          // Then by match score
          return b.matchScore - a.matchScore;
        });
      
      return filteredReviews;
    } catch (error) {
      return [];
    }
  };

  return {
    categorizeReviews
  };
};
