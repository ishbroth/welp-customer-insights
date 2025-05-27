import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import DuplicateReviewDialog from "@/components/reviews/DuplicateReviewDialog";
import { useAuth } from "@/contexts/auth";
import CustomerInfoForm from "@/components/reviews/CustomerInfoForm";
import RatingInput from "@/components/reviews/RatingInput";
import ReviewTextInput from "@/components/reviews/ReviewTextInput";
import PhotoUpload from "@/components/reviews/PhotoUpload";
import { useReviewSubmission } from "@/hooks/useReviewSubmission";
import { useDuplicateReviewCheck } from "@/hooks/useDuplicateReviewCheck";

const NewReview = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");
  const isEditing = searchParams.get("edit") === "true";
  const reviewId = searchParams.get("reviewId");
  
  // Get search parameters for pre-filling the form
  const searchParamFirstName = searchParams.get("firstName") || "";
  const searchParamLastName = searchParams.get("lastName") || "";
  const searchParamPhone = searchParams.get("phone") || "";
  const searchParamAddress = searchParams.get("address") || "";
  const searchParamCity = searchParams.get("city") || "";
  const searchParamZipCode = searchParams.get("zipCode") || "";
  
  const location = useLocation();
  const reviewData = location.state?.reviewData;
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [photos, setPhotos] = useState<Array<{ file: File; caption: string; preview: string }>>([]);
  
  // Duplicate review check states
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  
  const { 
    isSubmitting, 
    rejectionReason, 
    showRejectionDialog, 
    setShowRejectionDialog, 
    submitReview 
  } = useReviewSubmission(isEditing, reviewId);

  const { checkForDuplicateReview, isChecking } = useDuplicateReviewCheck();
  
  useEffect(() => {
    console.log("NewReview useEffect - isEditing:", isEditing, "reviewData:", reviewData);
    
    // Handle pre-filling data if we're editing
    if (isEditing && reviewData) {
      // Pre-fill review content and rating
      setRating(reviewData.rating);
      setComment(reviewData.content);
      
      // Parse customer name and pre-fill customer information
      const customerName = reviewData.customerName || "";
      const nameParts = customerName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      setCustomerFirstName(firstName);
      setCustomerLastName(lastName);
      setCustomerPhone(reviewData.phone || "");
      setCustomerAddress(reviewData.address || "");
      setCustomerCity(reviewData.city || "");
      setCustomerZipCode(reviewData.zipCode || "");
      
      console.log("Pre-filled customer data:", {
        firstName,
        lastName,
        phone: reviewData.phone,
        address: reviewData.address,
        city: reviewData.city,
        zipCode: reviewData.zipCode
      });
    } else {
      // Pre-fill form with search parameters from URL if not editing
      setCustomerFirstName(searchParamFirstName);
      setCustomerLastName(searchParamLastName);
      setCustomerPhone(searchParamPhone);
      setCustomerAddress(searchParamAddress);
      setCustomerCity(searchParamCity);
      setCustomerZipCode(searchParamZipCode);
    }
    
    if (customerId) {
      // In a real app, this would be a fetch call to your Supabase DB
      setIsLoading(true);
      setTimeout(() => {
        // Instead of using mock data, we'll assume this is a new customer
        setIsNewCustomer(true);
        setIsLoading(false);
      }, 500);
    } else {
      setIsNewCustomer(true);
      setIsLoading(false);
    }
  }, [
    customerId, 
    isEditing, 
    reviewData, 
    searchParamFirstName, 
    searchParamLastName, 
    searchParamPhone, 
    searchParamAddress, 
    searchParamCity, 
    searchParamZipCode
  ]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Skip duplicate check if we're editing an existing review
    if (!isEditing) {
      // Check for duplicate review before submitting
      const duplicate = await checkForDuplicateReview({
        firstName: customerFirstName,
        lastName: customerLastName,
        phone: customerPhone,
        address: customerAddress,
        city: customerCity,
        zipCode: customerZipCode
      });

      if (duplicate) {
        setExistingReview(duplicate);
        setShowDuplicateDialog(true);
        return;
      }
    }
    
    await submitReview({
      rating,
      comment,
      customerFirstName,
      customerLastName,
      customerPhone,
      customerAddress,
      customerCity,
      customerZipCode,
      photos // Add photos to the submission
    });
  };

  const handleEditExisting = () => {
    setShowDuplicateDialog(false);
    if (existingReview) {
      // Navigate to edit the existing review
      const reviewDataForEdit = {
        id: existingReview.id,
        rating: existingReview.rating,
        content: existingReview.content,
        customerName: existingReview.customer_name,
        address: existingReview.customer_address || "",
        city: existingReview.customer_city || "",
        zipCode: existingReview.customer_zipcode || "",
        phone: existingReview.customer_phone || ""
      };
      
      navigate(`/review/new?edit=true&reviewId=${existingReview.id}`, {
        state: {
          reviewData: reviewDataForEdit,
          isEditing: true
        }
      });
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateDialog(false);
    navigate("/profile");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
              {isEditing ? "Edit Customer Review" : "Write a Customer Review"}
            </h1>
            
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Customer Information */}
                  <CustomerInfoForm 
                    customerFirstName={customerFirstName}
                    customerLastName={customerLastName}
                    customerPhone={customerPhone}
                    customerAddress={customerAddress}
                    customerCity={customerCity}
                    customerZipCode={customerZipCode}
                    isNewCustomer={isNewCustomer}
                    customer={customer}
                    setCustomerFirstName={setCustomerFirstName}
                    setCustomerLastName={setCustomerLastName}
                    setCustomerPhone={setCustomerPhone}
                    setCustomerAddress={setCustomerAddress}
                    setCustomerCity={setCustomerCity}
                    setCustomerZipCode={setCustomerZipCode}
                  />
                  
                  {/* Rating */}
                  <RatingInput 
                    rating={rating}
                    setRating={setRating}
                    hoverRating={hoverRating}
                    setHoverRating={setHoverRating}
                  />
                  
                  {/* Review Text */}
                  <ReviewTextInput 
                    comment={comment}
                    setComment={setComment}
                  />
                  
                  {/* Photo Upload */}
                  <PhotoUpload 
                    photos={photos}
                    setPhotos={setPhotos}
                  />
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="welp-button w-full"
                      disabled={isSubmitting || isChecking}
                    >
                      {isSubmitting ? 
                        (isEditing ? "Updating..." : "Submitting...") : 
                        isChecking ? "Checking..." :
                        (isEditing ? "Update Review" : "Submit Review")}
                    </Button>
                  </div>
                </div>
              </form>
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
      <DuplicateReviewDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        onEditExisting={handleEditExisting}
        onCancel={handleCancelDuplicate}
        customerName={`${customerFirstName} ${customerLastName}`.trim()}
      />
    </div>
  );
};

export default NewReview;
