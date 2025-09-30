
import React from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import DuplicateReviewHandler from "@/components/reviews/DuplicateReviewHandler";
import ReviewForm from "@/components/reviews/ReviewForm";
import UploadProgressDialog from "@/components/reviews/UploadProgressDialog";
import SelfReviewWarning from "@/components/reviews/SelfReviewWarning";
import { useReviewFormState } from "@/hooks/useReviewFormState";
import { useReviewSubmission } from "@/hooks/useReviewSubmission";
import { useDuplicateReviewCheck } from "@/hooks/useDuplicateReviewCheck";
import { useSelfReviewCheck } from "@/hooks/useSelfReviewCheck";

const NewReview = () => {
  const [searchParams] = useSearchParams();
  const formState = useReviewFormState();
  const { 
    isSubmitting, 
    rejectionReason, 
    showRejectionDialog, 
    setShowRejectionDialog, 
    submitReview,
    uploadProgress
  } = useReviewSubmission(formState.isEditing, formState.reviewId);
  const { checkForDuplicateReview, isChecking } = useDuplicateReviewCheck();
  const { isSelfReview, isCheckingPhone } = useSelfReviewCheck(formState.customerPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 FORM SUBMISSION STARTED");
    console.log("Form state data:", {
      isEditing: formState.isEditing,
      reviewId: formState.reviewId,
      customerState: formState.customerState,
      associates: formState.associates
    });

    // Check for self-review first
    if (isSelfReview) {
      console.log("❌ Blocking submission - self review detected");
      return; // Block submission if it's a self-review
    }
    
    // Skip duplicate check if we're editing an existing review
    if (!formState.isEditing) {
      // Check for duplicate review before submitting
      const duplicate = await checkForDuplicateReview({
        firstName: formState.customerFirstName,
        lastName: formState.customerLastName,
        phone: formState.customerPhone,
        address: formState.customerAddress,
        city: formState.customerCity,
        zipCode: formState.customerZipCode
      });

      if (duplicate) {
        formState.setExistingReview(duplicate);
        formState.setShowDuplicateDialog(true);
        return;
      }
    }
    
    console.log("Associates data being submitted:", formState.associates);

    await submitReview({
      rating: formState.rating,
      comment: formState.comment,
      customerFirstName: formState.customerFirstName,
      customerLastName: formState.customerLastName,
      customerNickname: formState.customerNickname,
      customerBusinessName: formState.customerBusinessName,
      customerPhone: formState.customerPhone,
      customerAddress: formState.customerAddress,
      customerCity: formState.customerCity,
      customerState: formState.customerState,
      customerZipCode: formState.customerZipCode,
      associates: formState.associates,
      photos: formState.photos
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
              {formState.isEditing ? "Edit Customer Review" : "Write a Customer Review"}
            </h1>
            
            {formState.isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <>
                {/* Self-Review Warning */}
                {isSelfReview && <SelfReviewWarning />}
                
                <ReviewForm
                  isEditing={formState.isEditing}
                  isSubmitting={isSubmitting || isSelfReview}
                  isChecking={isChecking || isCheckingPhone}
                  onSubmit={handleSubmit}
                  customer={formState.customer}
                  isNewCustomer={formState.isNewCustomer}
                  customerFirstName={formState.customerFirstName}
                  setCustomerFirstName={formState.setCustomerFirstName}
                  customerLastName={formState.customerLastName}
                  setCustomerLastName={formState.setCustomerLastName}
                  customerNickname={formState.customerNickname}
                  setCustomerNickname={formState.setCustomerNickname}
                  customerBusinessName={formState.customerBusinessName}
                  setCustomerBusinessName={formState.setCustomerBusinessName}
                  customerPhone={formState.customerPhone}
                  setCustomerPhone={formState.setCustomerPhone}
                  customerAddress={formState.customerAddress}
                  setCustomerAddress={formState.setCustomerAddress}
                  customerCity={formState.customerCity}
                  setCustomerCity={formState.setCustomerCity}
                  customerState={formState.customerState}
                  setCustomerState={formState.setCustomerState}
                  customerZipCode={formState.customerZipCode}
                  setCustomerZipCode={formState.setCustomerZipCode}
                  rating={formState.rating}
                  setRating={formState.setRating}
                  hoverRating={formState.hoverRating}
                  setHoverRating={formState.setHoverRating}
                  comment={formState.comment}
                  setComment={formState.setComment}
                  photos={formState.photos}
                  setPhotos={formState.setPhotos}
                  associates={formState.associates}
                  setAssociates={formState.setAssociates}
                />
              </>
            )}
          </Card>
        </div>
      </main>
      <Footer />
      
      {/* Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
        onClose={() => setShowRejectionDialog(false)}
      />

      {/* Duplicate Review Dialog */}
      <DuplicateReviewHandler
        showDuplicateDialog={formState.showDuplicateDialog}
        setShowDuplicateDialog={formState.setShowDuplicateDialog}
        existingReview={formState.existingReview}
        customerFirstName={formState.customerFirstName}
        customerLastName={formState.customerLastName}
      />

      {/* Upload Progress Dialog */}
      <UploadProgressDialog
        open={uploadProgress.isUploading}
        progress={uploadProgress.uploadProgress}
        isComplete={uploadProgress.isUploadComplete}
        totalPhotos={formState.photos.length}
        currentPhoto={uploadProgress.currentPhotoIndex}
      />
    </div>
  );
};

export default NewReview;
