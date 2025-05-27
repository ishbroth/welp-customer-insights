
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { moderateContent } from "@/utils/contentModeration";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useReviewSubmission = (isEditing: boolean, reviewId: string | null) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const uploadPhotos = async (photos: Array<{ file: File; caption: string; preview: string }>, reviewId: string) => {
    const uploadedPhotos = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileExt = photo.file.name.split('.').pop();
      const fileName = `${currentUser?.id}/${reviewId}/${Date.now()}-${i}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(fileName, photo.file);

      if (uploadError) {
        console.error("Error uploading photo:", uploadError);
        throw new Error(`Failed to upload photo: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(fileName);

      uploadedPhotos.push({
        photo_url: publicUrl,
        caption: photo.caption || null,
        display_order: i
      });
    }

    return uploadedPhotos;
  };

  const submitReview = async (reviewData: {
    rating: number;
    comment: string;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    customerZipCode: string;
    photos?: Array<{ file: File; caption: string; preview: string }>;
  }) => {
    const { 
      rating, 
      comment, 
      customerFirstName, 
      customerLastName, 
      customerPhone, 
      customerAddress, 
      customerCity, 
      customerZipCode,
      photos = []
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
      // Use the current user's ID as the business_id (for business owners submitting reviews)
      const businessId = currentUser.id;
      
      // Prepare review data
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
      let finalReviewId = reviewId;
      
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
          .insert([supabaseReviewData])
          .select()
          .single();
        
        if (result.data) {
          finalReviewId = result.data.id;
        }
      }
      
      if (result.error) {
        console.error("Database error:", result.error);
        throw new Error(result.error.message);
      }

      // Upload photos if any
      if (photos.length > 0 && finalReviewId) {
        try {
          const uploadedPhotos = await uploadPhotos(photos, finalReviewId);
          
          // Save photo records to database
          const { error: photoError } = await supabase
            .from('review_photos')
            .insert(
              uploadedPhotos.map(photo => ({
                review_id: finalReviewId,
                ...photo
              }))
            );

          if (photoError) {
            console.error("Error saving photo records:", photoError);
            // Don't fail the entire submission for photo errors
            toast({
              title: "Photo Upload Warning",
              description: "Review submitted but some photos may not have been saved.",
              variant: "default",
            });
          }
        } catch (photoError) {
          console.error("Error uploading photos:", photoError);
          // Don't fail the entire submission for photo errors
          toast({
            title: "Photo Upload Warning",
            description: "Review submitted but photos could not be uploaded.",
            variant: "default",
          });
        }
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
