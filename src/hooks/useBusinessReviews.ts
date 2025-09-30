
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Review } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Helper function to calculate sort priority
const calculateSortPriority = (claimedBy: string | undefined, hasConversation: boolean, hasResponses: boolean): number => {
  const isClaimed = !!claimedBy;
  const hasActivity = hasConversation || hasResponses;
  
  if (isClaimed && hasActivity) {
    return 1; // Tier 1: Claimed with activity (highest priority)
  } else if (isClaimed) {
    return 2; // Tier 2: Claimed without activity
  } else {
    return 3; // Tier 3: Unclaimed (lowest priority)
  }
};

export const useBusinessReviews = (onRefresh?: () => void) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [workingReviews, setWorkingReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinessReviews = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Fetch reviews written by this business with claim info, conversations, and responses
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          created_at,
          customer_name,
          customer_nickname,
          customer_business_name,
          customer_address,
          customer_city,
          customer_zipcode,
          customer_phone,
          review_claims(claimed_by),
          conversation_participants(id),
          responses(id)
        `)
        .eq('business_id', currentUser.id)
        .is('deleted_at', null) // Only get non-deleted reviews

      console.log("BusinessReviews: Query result:", { reviewsData, error });
      console.log("🔍 RAW QUERY DATA - First review:", reviewsData?.[0]);
      console.log("🔍 RAW QUERY DATA - Customer nickname:", reviewsData?.[0]?.customer_nickname);
      console.log("🔍 RAW QUERY DATA - Customer business name:", reviewsData?.[0]?.customer_business_name);

      if (error) {
        throw error;
      }

      console.log("BusinessReviews: Found reviews:", reviewsData?.length || 0);
      console.log("BusinessReviews: Raw data sample:", reviewsData?.[0]);

      // Format reviews data to match Review type and calculate activity status
      const formattedReviews = (reviewsData || []).map(review => {
        // Fix claimedBy detection - handle null values properly
        const claimedBy = (review.review_claims && Array.isArray(review.review_claims) && review.review_claims.length > 0) 
          ? review.review_claims[0]?.claimed_by 
          : undefined;
        
        // Fix conversation detection - handle null values from Supabase
        const hasConversation = review.conversation_participants !== null 
          && Array.isArray(review.conversation_participants) 
          && review.conversation_participants.length > 0 
          && review.conversation_participants.some(cp => cp && cp.id);
        
        // Fix response detection - handle null values from Supabase
        const hasResponses = review.responses !== null 
          && Array.isArray(review.responses) 
          && review.responses.length > 0 
          && review.responses.some(r => r && r.id);

        // Debug logging to verify detection
        console.log(`Review ${review.customer_name}:`, {
          claimedBy,
          hasConversation,
          hasResponses,
          conversation_participants: review.conversation_participants,
          responses: review.responses,
          review_claims: review.review_claims
        });
        
        // Ensure we have a valid date string - use the raw created_at value
        const reviewDate = review.created_at || new Date().toISOString();
        
        console.log("BusinessReviews: Processing review:", {
          id: review.id,
          customer_name: review.customer_name,
          customer_nickname: review.customer_nickname,
          customer_business_name: review.customer_business_name,
          created_at: review.created_at,
          reviewDate: reviewDate,
          review_claims: review.review_claims,
          claimedBy: claimedBy,
          hasConversation: hasConversation,
          hasResponses: hasResponses
        });
        
        const formattedReview: Review = {
          id: review.id,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name || "Anonymous Business",
          reviewerAvatar: currentUser.avatar,
          customerId: claimedBy || "unclaimed",
          customerName: review.customer_name || "Anonymous Customer",
          rating: review.rating,
          content: review.content,
          date: reviewDate,
          // Map database fields correctly to Review interface
          address: review.customer_address || "",
          city: review.customer_city || "",
          state: review.customer_state || "",
          zipCode: review.customer_zipcode || "",
          associates: review.associates || [],
          // Store additional customer fields for compatibility
          customer_address: review.customer_address || "",
          customer_city: review.customer_city || "",
          customer_state: review.customer_state || "",
          customer_zipcode: review.customer_zipcode || "",
          customer_phone: review.customer_phone || "",
          customer_nickname: review.customer_nickname || "",
          customer_business_name: review.customer_business_name || "",
          reactions: { like: [], funny: [], ohNo: [] },
          responses: []
        };
        
        // Add sorting priority metadata
        (formattedReview as any)._sortPriority = calculateSortPriority(claimedBy, hasConversation, hasResponses);
        
        console.log("BusinessReviews: Formatted review:", {
          id: formattedReview.id,
          customerName: formattedReview.customerName,
          customer_nickname: formattedReview.customer_nickname,
          customer_business_name: formattedReview.customer_business_name,
          date: formattedReview.date,
          sortPriority: (formattedReview as any)._sortPriority
        });
        
        return formattedReview;
      });

      // Sort reviews with multi-tier priority:
      // Tier 1: Claimed AND has activity (conversations/responses)
      // Tier 2: Claimed but no activity
      // Tier 3: Unclaimed
      // Within each tier, sort by created_at descending
      const sortedReviews = formattedReviews.sort((a, b) => {
        const aPriority = (a as any)._sortPriority;
        const bPriority = (b as any)._sortPriority;
        
        // First, sort by priority (lower number = higher priority)
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // Within same priority, sort by date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Clean up temporary sort priority metadata
      sortedReviews.forEach(review => {
        delete (review as any)._sortPriority;
      });

      setWorkingReviews(sortedReviews);
      
      console.log("BusinessReviews: Final formatted reviews:", formattedReviews.map(r => ({
        id: r.id,
        customerName: r.customerName,
        date: r.date,
        dateType: typeof r.date,
        dateValue: JSON.stringify(r.date)
      })));
      
      console.log("BusinessReviews: Formatted reviews with responses:", formattedReviews);
      
      if (reviewsData && reviewsData.length > 0) {
        const responsesCount = formattedReviews.reduce((acc, review) => acc + (review.responses?.length || 0), 0);
        toast({
          title: "Reviews Loaded",
          description: `Found ${reviewsData.length} reviews${responsesCount > 0 ? ` with ${responsesCount} customer responses` : ''}.`,
        });
      }
      
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      toast({
        title: "Error",
        description: "There was an error fetching your reviews. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    console.log("🗑️ Attempting to hard delete review:", reviewId);
    console.log("Current user:", currentUser?.id);
    
    if (!currentUser) {
      console.error("❌ No current user found, cannot delete review");
      toast({
        title: "Error",
        description: "You must be logged in to delete reviews.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Call the edge function to perform hard delete
      const { data, error } = await supabase.functions.invoke('delete-review', {
        body: { reviewId }
      });

      console.log("Delete edge function result:", { data, error });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to delete review");
      }

    // Remove from local state immediately since it's been hard deleted
    setWorkingReviews(prev => prev.filter(review => review.id !== reviewId));
    
    toast({
      title: "Review deleted",
      description: "Your review and all associated data have been permanently deleted.",
    });
    
    // Trigger data refresh if callback provided
    if (onRefresh) {
      onRefresh();
    }
      
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: `There was an error deleting the review: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Fetch reviews from database
  useEffect(() => {
    if (currentUser) {
      fetchBusinessReviews();
    }
  }, [currentUser]);

  return {
    workingReviews,
    setWorkingReviews,
    isLoading,
    fetchBusinessReviews,
    deleteReview
  };
};
