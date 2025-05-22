
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { moderateContent } from "@/utils/contentModeration";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { v4 as uuidv4 } from "uuid";

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
      // For test accounts or normal users, ensure we're using their ID
      const businessId = currentUser.id;
      
      console.log("Current user ID:", businessId);
      
      // First, check if a profile exists with this ID
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', businessId)
        .single();
        
      console.log("Existing profile check:", existingProfile, profileError);
      
      // If no profile exists and we're using a test account, create one
      if (!existingProfile && profileError) {
        console.log("Creating profile for test account");
        
        // Create a profile for the test user to satisfy foreign key constraints
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: businessId,
            name: 'Test Business Account',
            type: 'business'
          }]);
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw new Error(`Failed to create user profile: ${insertError.message}`);
        }
        
        console.log("Test profile created successfully");
      }
      
      // Prepare review data with the business ID
      const supabaseReviewData = {
        business_id: businessId,
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
        throw new Error(result.error.message);
      }
      
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
