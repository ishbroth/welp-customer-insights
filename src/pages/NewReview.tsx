
import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import DuplicateReviewHandler from "@/components/reviews/DuplicateReviewHandler";
import ReviewForm from "@/components/reviews/ReviewForm";
import UploadProgressDialog from "@/components/reviews/UploadProgressDialog";
import SelfReviewWarning from "@/components/reviews/SelfReviewWarning";
import NewReviewBackground from "@/components/NewReviewBackground";
import { useReviewFormState } from "@/hooks/useReviewFormState";
import { useReviewSubmission } from "@/hooks/useReviewSubmission";
import { useDuplicateReviewCheck } from "@/hooks/useDuplicateReviewCheck";
import { useSelfReviewCheck } from "@/hooks/useSelfReviewCheck";
import { logger } from '@/utils/logger';

const NewReview = () => {
  const pageLogger = logger.withContext('NewReview');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    pageLogger.debug("🚀 FORM SUBMISSION STARTED");
    pageLogger.debug("Form state data:", {
      isEditing: formState.isEditing,
      reviewId: formState.reviewId,
      customerState: formState.customerState,
      associates: formState.associates,
      isAnonymous: formState.isAnonymous
    });

    // Check for self-review first
    if (isSelfReview) {
      pageLogger.debug("❌ Blocking submission - self review detected");
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

    pageLogger.debug("Associates data being submitted:", formState.associates);

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
      photos: formState.photos,
      isAnonymous: formState.isAnonymous
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8 relative">
        <NewReviewBackground />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-sm text-white hover:text-gray-200 transition-colors py-1"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </button>
          </div>
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
                  isAnonymous={formState.isAnonymous}
                  setIsAnonymous={formState.setIsAnonymous}
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
