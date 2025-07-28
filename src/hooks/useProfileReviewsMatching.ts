
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useReviewMatching } from "@/hooks/useReviewMatching";
import { doesReviewMatchUser } from "@/utils/reviewMatching";

export const useProfileReviewsMatching = () => {
  const { checkReviewMatch } = useReviewMatching();

  const categorizeReviews = async (currentUser: any) => {
    console.log("🎯 Categorizing reviews for user:", currentUser?.id, currentUser?.type);
    
    // Fetch all reviews with business profile information
    const { data: allReviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles!business_id(
          name,
          avatar,
          verified,
          type
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    console.log("🎯 Found reviews:", allReviews?.length || 0);

    const reviewMatches = (allReviews || []).map(review => {
      // CRITICAL FIX: Don't process reviews written BY the current user as potential matches
      if (review.business_id === currentUser?.id) {
        console.log("🎯 Skipping review written by current user:", review.id);
        return null; // Skip reviews written by the current user
      }

      // CRITICAL FIX: Only consider a review "claimed" if customer_id is explicitly set in database
      // AND it matches the current user's ID
      const isExplicitlyClaimed = review.customer_id && review.customer_id === currentUser?.id;
      
      console.log("🎯 Review claim status check:", {
        reviewId: review.id,
        database_customer_id: review.customer_id,
        currentUserId: currentUser?.id,
        isExplicitlyClaimed,
        customer_name: review.customer_name
      });
      
      if (isExplicitlyClaimed) {
        console.log("🎯 Review explicitly claimed by current user:", review.id);
        return {
          review: {
            ...review,
            reviewerName: review.profiles?.name || 'Business',
            reviewerAvatar: review.profiles?.avatar || '',
            reviewerVerified: review.profiles?.verified || false,
            customerId: review.customer_id, // Keep the actual database value ONLY for claimed reviews
            customer_id: review.customer_id // Keep database field for consistency
          },
          matchType: 'claimed' as const,
          matchScore: 100,
          matchReasons: ['Review claimed by you'],
          detailedMatches: []
        };
      }

      // For unclaimed reviews, check if they match the current user
      const matchResult = checkReviewMatch(review, currentUser);
      
      console.log("🎯 Match result for review", review.id, ":", matchResult);
      
      // Only consider it a match if the score is above a threshold
      if (matchResult.score >= 50) {
        const matchType = matchResult.score >= 80 ? 'high_quality' : 'potential';
        
        return {
          review: {
            ...review,
            reviewerName: review.profiles?.name || 'Business',
            reviewerAvatar: review.profiles?.avatar || '',
            reviewerVerified: review.profiles?.verified || false,
            // CRITICAL FIX: Explicitly null out both fields for unclaimed reviews
            customerId: null, // Frontend field - null for unclaimed
            customer_id: null, // Database field - null for unclaimed to prevent confusion
          },
          matchType,
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons,
          detailedMatches: matchResult.detailedMatches || []
        };
      }

      return null; // No match found
    }).filter(match => match !== null); // Remove null entries

    console.log("🎯 Final categorized reviews:", reviewMatches.length);
    return reviewMatches;
  };

  return { categorizeReviews };
};
