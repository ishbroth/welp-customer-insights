
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import DuplicateReviewHandler from "@/components/reviews/DuplicateReviewHandler";
import ReviewForm from "@/components/reviews/ReviewForm";
import UploadProgressDialog from "@/components/reviews/UploadProgressDialog";
import { useReviewFormState } from "@/hooks/useReviewFormState";
import { useReviewSubmission } from "@/hooks/useReviewSubmission";
import { useDuplicateReviewCheck } from "@/hooks/useDuplicateReviewCheck";

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

  // Pre-fill form from URL parameters
  useEffect(() => {
    const customerFirstName = searchParams.get('customerFirstName');
    const customerLastName = searchParams.get('customerLastName');
    const customerPhone = searchParams.get('customerPhone');
    const customerAddress = searchParams.get('customerAddress');
    const customerCity = searchParams.get('customerCity');
    const customerState = searchParams.get('customerState');
    const customerZipCode = searchParams.get('customerZipCode');
    const rating = searchParams.get('rating');
    const comment = searchParams.get('comment');

    if (customerFirstName) formState.setCustomerFirstName(customerFirstName);
    if (customerLastName) formState.setCustomerLastName(customerLastName);
    if (customerPhone) formState.setCustomerPhone(customerPhone);
    if (customerAddress) formState.setCustomerAddress(customerAddress);
    if (customerCity) formState.setCustomerCity(customerCity);
    if (customerState) formState.setCustomerState(customerState);
    if (customerZipCode) formState.setCustomerZipCode(customerZipCode);
    if (rating) formState.setRating(parseInt(rating));
    if (comment) formState.setComment(comment);
  }, [searchParams, formState]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    await submitReview({
      rating: formState.rating,
      comment: formState.comment,
      customerFirstName: formState.customerFirstName,
      customerLastName: formState.customerLastName,
      customerPhone: formState.customerPhone,
      customerAddress: formState.customerAddress,
      customerCity: formState.customerCity,
      customerState: formState.customerState,
      customerZipCode: formState.customerZipCode,
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
              <ReviewForm
                isEditing={formState.isEditing}
                isSubmitting={isSubmitting}
                isChecking={isChecking}
                onSubmit={handleSubmit}
                customer={formState.customer}
                isNewCustomer={formState.isNewCustomer}
                customerFirstName={formState.customerFirstName}
                setCustomerFirstName={formState.setCustomerFirstName}
                customerLastName={formState.customerLastName}
                setCustomerLastName={formState.setCustomerLastName}
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
              />
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
