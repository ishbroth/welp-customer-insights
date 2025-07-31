
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Review } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessReviews = (onRefresh?: () => void) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [workingReviews, setWorkingReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinessReviews = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Fetch reviews written by this business with claim info using LEFT JOIN
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          created_at,
          customer_name,
          customer_address,
          customer_city,
          customer_zipcode,
          customer_phone,
          review_claims!left(claimed_by)
        `)
        .eq('business_id', currentUser.id)
        .is('deleted_at', null) // Only get non-deleted reviews
        .order('created_at', { ascending: false });

      console.log("BusinessReviews: Query result:", { reviewsData, error });

      if (error) {
        throw error;
      }

      console.log("BusinessReviews: Found reviews:", reviewsData?.length || 0);
      console.log("BusinessReviews: Raw data sample:", reviewsData?.[0]);

      // No responses in this simplified version
      const reviewsWithResponses = reviewsData || [];

      // Format reviews data to match Review type
      const formattedReviews = reviewsWithResponses.map(review => {
        const claimedBy = review.review_claims?.[0]?.claimed_by;
        
        // Ensure we have a valid date string
        const reviewDate = review.created_at ? new Date(review.created_at).toISOString() : new Date().toISOString();
        
        console.log("BusinessReviews: Processing review:", {
          id: review.id,
          customer_name: review.customer_name,
          created_at: review.created_at,
          reviewDate: reviewDate,
          review_claims: review.review_claims,
          claimedBy: claimedBy
        });
        
        const formattedReview: Review = {
          id: review.id,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name || "Anonymous Business",
          reviewerAvatar: currentUser.avatar,
          customerId: claimedBy || null, // Use claimed customer ID if available, null if not claimed
          customerName: review.customer_name || "Anonymous Customer",
          rating: review.rating,
          content: review.content,
          date: reviewDate, // Ensure consistent date format
          // Map database fields correctly to Review interface
          address: review.customer_address || "",
          city: review.customer_city || "",
          zipCode: review.customer_zipcode || "",
          // Store additional customer fields for compatibility
          customer_address: review.customer_address || "",
          customer_city: review.customer_city || "",
          customer_zipcode: review.customer_zipcode || "",
          customer_phone: review.customer_phone || "",
          reactions: { like: [], funny: [], ohNo: [] },
          responses: []
        };
        
        console.log("BusinessReviews: Formatted review:", {
          id: formattedReview.id,
          customerName: formattedReview.customerName,
          date: formattedReview.date
        });
        
        return formattedReview;
      });

      setWorkingReviews(formattedReviews);
      
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
