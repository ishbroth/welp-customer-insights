
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Review } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessReviews = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [workingReviews, setWorkingReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinessReviews = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Fetch reviews written by this business (not soft deleted)
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
          customer_phone
        `)
        .eq('business_id', currentUser.id)
        .is('deleted_at', null) // Only get non-deleted reviews
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("BusinessReviews: Found reviews:", reviewsData?.length || 0);
      console.log("BusinessReviews: Raw data sample:", reviewsData?.[0]);

      // No responses in this simplified version
      const reviewsWithResponses = reviewsData || [];

      // Format reviews data to match Review type
      const formattedReviews = reviewsWithResponses.map(review => {
        console.log("BusinessReviews: Processing review:", {
          id: review.id,
          customer_name: review.customer_name,
          created_at: review.created_at,
          raw_review: review
        });
        
        return {
          id: review.id,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name || "Anonymous Business",
          reviewerAvatar: currentUser.avatar,
          customerId: '', // No longer using customer_id
          customerName: review.customer_name || "Anonymous Customer",
          rating: review.rating,
          content: review.content,
          date: review.created_at, // Keep original ISO format
          // Map database fields correctly to Review interface
          address: review.customer_address || "",
          city: review.customer_city || "",
          zipCode: review.customer_zipcode || "",
          // Store additional customer fields for compatibility
          customer_address: review.customer_address || "",
          customer_city: review.customer_city || "",
          customer_zipcode: review.customer_zipcode || "",
          customer_phone: review.customer_phone || "",
          reactions: { like: [], funny: [], useful: [], ohNo: [] },
          responses: []
        };
      });

      setWorkingReviews(formattedReviews);
      
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
    console.log("🗑️ Attempting to delete review:", reviewId);
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
      // Soft delete the review by setting deleted_at
      const { data, error } = await supabase
        .from('reviews')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', reviewId)
        .eq('business_id', currentUser?.id) // Ensure only business owner can delete
        .select();

      console.log("Delete result:", { data, error });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Review not found or you don't have permission to delete it");
      }

      setWorkingReviews(prev => prev.filter(review => review.id !== reviewId));
      
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      });
      
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
