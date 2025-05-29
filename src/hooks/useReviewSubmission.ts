
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useContentValidation } from "@/hooks/useContentValidation";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { submitReviewToDatabase, type ReviewSubmissionData } from "@/services/reviewSubmissionService";
import { uploadReviewPhotos, savePhotoRecords, type PhotoUpload } from "@/services/photoUploadService";

interface SubmitReviewParams extends ReviewSubmissionData {
  photos?: PhotoUpload[];
}

export const useReviewSubmission = (isEditing: boolean, reviewId: string | null) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    rejectionReason,
    showRejectionDialog,
    setShowRejectionDialog,
    validateContent
  } = useContentValidation();

  const uploadProgress = useUploadProgress();

  const submitReview = async (reviewData: SubmitReviewParams): Promise<boolean> => {
    const { photos = [], ...submitData } = reviewData;
    
    if (submitData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating for this customer.",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate content
    if (!validateContent(submitData.comment)) {
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
    
    // Start upload progress if there are photos
    if (photos.length > 0) {
      uploadProgress.startUpload(photos.length);
    }
    
    try {
      // Submit review to database
      const finalReviewId = await submitReviewToDatabase(
        submitData,
        currentUser.id,
        isEditing,
        reviewId
      );

      // Handle photo uploads if any
      if (photos.length > 0) {
        try {
          const uploadedPhotos = await uploadReviewPhotos(
            photos, 
            finalReviewId, 
            currentUser.id,
            uploadProgress.updateProgress
          );
          await savePhotoRecords(uploadedPhotos, finalReviewId, isEditing);
          uploadProgress.completeUpload();
        } catch (photoError) {
          console.error("Error uploading photos:", photoError);
          uploadProgress.resetUpload();
          // Don't fail the entire submission for photo errors
          toast({
            title: "Photo Upload Warning",
            description: "Review submitted but some photos may not have been saved.",
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
      uploadProgress.resetUpload();
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
    submitReview,
    uploadProgress
  };
};
