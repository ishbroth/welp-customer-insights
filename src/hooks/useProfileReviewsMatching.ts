
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useReviewMatching } from "@/hooks/useReviewMatching";

export const useProfileReviewsMatching = () => {
  const { checkReviewMatch } = useReviewMatching();

  const categorizeReviews = async (currentUser: any) => {
    console.log("🔍 CRITICAL DEBUG: Categorizing reviews for user:", {
      userId: currentUser?.id,
      userType: currentUser?.type,
      userName: currentUser?.name,
      userPhone: currentUser?.phone,
      userAddress: currentUser?.address,
      userCity: currentUser?.city,
      userZipcode: currentUser?.zipcode,
      timestamp: new Date().toISOString()
    });
    
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
      console.error("❌ Error fetching reviews:", error);
      return [];
    }

    console.log("📊 TOTAL REVIEWS FOUND:", allReviews?.length || 0);
    
    // Log sample of reviews for debugging
    if (allReviews && allReviews.length > 0) {
      console.log("📋 SAMPLE REVIEWS (first 5):", allReviews.slice(0, 5).map(r => ({
        id: r.id,
        customer_name: r.customer_name,
        customer_phone: r.customer_phone,
        customer_address: r.customer_address,
        customer_city: r.customer_city,
        customer_zipcode: r.customer_zipcode,
        customer_id: r.customer_id,
        business_name: r.profiles?.name
      })));
    }

    // Log which reviews are actually claimed in the database
    const claimedReviews = allReviews?.filter(review => review.customer_id) || [];
    console.log("🎯 CLAIMED REVIEWS IN DB:", claimedReviews.map(r => ({
      id: r.id,
      customer_name: r.customer_name,
      customer_id: r.customer_id,
      claimed_at: r.claimed_at
    })));

    const reviewMatches = (allReviews || []).map(review => {
      // Skip reviews written BY the current user
      if (review.business_id === currentUser?.id) {
        console.log("⏭️ Skipping review written by current user:", review.id);
        return null;
      }

      // CRITICAL FIX: Check if review is explicitly claimed by current user
      const isExplicitlyClaimed = review.customer_id === currentUser?.id;
      
      console.log("🔍 REVIEW CLAIM CHECK:", {
        reviewId: review.id,
        database_customer_id: review.customer_id,
        currentUserId: currentUser?.id,
        isExplicitlyClaimed,
        customer_name: review.customer_name,
        customer_phone: review.customer_phone
      });
      
      if (isExplicitlyClaimed) {
        console.log("✅ Review explicitly claimed by current user:", review.id);
        return {
          review: {
            ...review,
            reviewerName: review.profiles?.name || 'Business',
            reviewerAvatar: review.profiles?.avatar || '',
            reviewerVerified: review.profiles?.verified || false,
            customerId: review.customer_id, // CRITICAL: Map customer_id to customerId
            customerName: review.customer_name,
            customer_phone: review.customer_phone,
            isClaimed: true
          },
          matchType: 'claimed' as const,
          matchScore: 100,
          matchReasons: ['Review claimed by you'],
          detailedMatches: []
        };
      }

      // For unclaimed reviews, check if they match the current user
      const matchResult = checkReviewMatch(review, currentUser);
      
      console.log("🎯 MATCH RESULT for review", review.id, ":", {
        score: matchResult.score,
        reasons: matchResult.reasons,
        reviewCustomerName: review.customer_name,
        reviewCustomerPhone: review.customer_phone,
        userProfile: {
          name: currentUser?.name,
          phone: currentUser?.phone,
          address: currentUser?.address
        }
      });
      
      // Show both high quality matches AND potential matches (lowered threshold)
      if (matchResult.score >= 30) {
        const matchType = matchResult.score >= 80 ? 'high_quality' : 'potential';
        
        console.log("✅ MATCH FOUND:", {
          reviewId: review.id,
          matchType,
          score: matchResult.score,
          reasons: matchResult.reasons
        });
        
        return {
          review: {
            ...review,
            reviewerName: review.profiles?.name || 'Business',
            reviewerAvatar: review.profiles?.avatar || '',
            reviewerVerified: review.profiles?.verified || false,
            customerId: review.customer_id, // CRITICAL: This will be null for unclaimed reviews
            customerName: review.customer_name,
            customer_phone: review.customer_phone,
            isClaimed: false // Only true if explicitly claimed by current user
          },
          matchType,
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons,
          detailedMatches: matchResult.detailedMatches || []
        };
      }

      console.log("❌ NO MATCH for review", review.id, "- score too low:", matchResult.score);
      return null;
    }).filter(match => match !== null);

    console.log("🎯 FINAL CATEGORIZED REVIEWS:", {
      totalMatches: reviewMatches.length,
      claimedCount: reviewMatches.filter(m => m.matchType === 'claimed').length,
      highQualityCount: reviewMatches.filter(m => m.matchType === 'high_quality').length,
      potentialCount: reviewMatches.filter(m => m.matchType === 'potential').length,
      reviewIds: reviewMatches.map(m => m.review.id),
      CRITICAL_CUSTOMER_IDS: reviewMatches.map(m => ({
        reviewId: m.review.id,
        customerId: m.review.customerId,
        shouldShowAsClaimed: m.review.customerId === currentUser?.id
      }))
    });
    
    return reviewMatches;
  };

  return { categorizeReviews };
};
