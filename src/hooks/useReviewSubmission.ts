
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { moderateContent } from "@/utils/contentModeration";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { createSearchableCustomer } from "@/services/customerService";

export const useReviewSubmission = (isEditing: boolean, reviewId: string | null) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const submitReview = async (reviewData: {
    rating: number;
    comment: string;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    customerZipCode: string;
  }) => {
    const { 
      rating, 
      comment, 
      customerFirstName, 
      customerLastName, 
      customerPhone, 
      customerAddress, 
      customerCity, 
      customerZipCode 
    } = reviewData;
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating for this customer.",
        variant: "destructive",
      });
      return false;
    }
    
    // Add content moderation check
    const moderationResult = moderateContent(comment);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return false;
    }
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit a review.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("=== REVIEW SUBMISSION START ===");
      
      // First, create or find the customer profile
      const customerResult = await createSearchableCustomer({
        firstName: customerFirstName,
        lastName: customerLastName,
        phone: customerPhone,
        address: customerAddress,
        city: customerCity,
        state: "", // TODO: Add state field to form if needed
        zipCode: customerZipCode,
      });
      
      if (!customerResult.success) {
        throw new Error(customerResult.error || "Failed to create customer profile");
      }
      
      console.log("Customer profile created/found:", customerResult.customerId);
      
      // Use the current user's ID as the business_id (for business owners submitting reviews)
      const businessId = currentUser.id;
      
      // Prepare review data with proper customer_id linking
      const supabaseReviewData = {
        business_id: businessId,
        customer_id: customerResult.customerId, // Proper foreign key reference
        rating: rating,
        content: comment,
        customer_name: `${customerFirstName} ${customerLastName}`.trim(),
        customer_address: customerAddress,
        customer_city: customerCity,
        customer_zipcode: customerZipCode,
        customer_phone: customerPhone,
      };
      
      console.log("Submitting review with data:", supabaseReviewData);
      
      let result;
      
      if (isEditing && reviewId) {
        // Update existing review
        result = await supabase
          .from('reviews')
          .update(supabaseReviewData)
          .eq('id', reviewId);
      } else {
        // Insert new review
        result = await supabase
          .from('reviews')
          .insert([supabaseReviewData]);
      }
      
      if (result.error) {
        console.error("Database error:", result.error);
        throw new Error(result.error.message);
      }
      
      console.log("Review submitted successfully");
      
      toast({
        title: isEditing ? "Review Updated" : "Review Submitted",
        description: isEditing 
          ? "Your customer review has been successfully updated." 
          : "Your customer review has been successfully submitted.",
      });
      
      // Navigate to success page
      navigate("/review/success");
      return true;
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: `Failed to submit review: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    rejectionReason,
    showRejectionDialog,
    setShowRejectionDialog,
    submitReview
  };
};
