import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import CustomerInfoForm from "@/components/reviews/CustomerInfoForm";
import RatingInput from "@/components/reviews/RatingInput";
import ReviewTextInput from "@/components/reviews/ReviewTextInput";
import PhotoUpload from "@/components/reviews/PhotoUpload";
import AssociatesInput from "@/components/reviews/AssociatesInput";
import { AddressComponents } from "@/utils/addressExtraction";

interface ReviewFormProps {
  isEditing: boolean;
  isSubmitting: boolean;
  isChecking: boolean;
  onSubmit: (e: React.FormEvent) => void;
  
  // Customer info props
  customer: any;
  isNewCustomer: boolean;
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerNickname: string;
  setCustomerNickname: (value: string) => void;
  customerBusinessName: string;
  setCustomerBusinessName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerAddress: string;
  setCustomerAddress: (value: string) => void;
  customerCity: string;
  setCustomerCity: (value: string) => void;
  customerState: string;
  setCustomerState: (value: string) => void;
  customerZipCode: string;
  setCustomerZipCode: (value: string) => void;
  
  // Rating props
  rating: number;
  setRating: (rating: number) => void;
  hoverRating: number;
  setHoverRating: (rating: number) => void;
  
  // Review text props
  comment: string;
  setComment: (comment: string) => void;
  
  // Photo props
  photos: Array<{ file: File; caption: string; preview: string }>;
  setPhotos: React.Dispatch<React.SetStateAction<Array<{ file: File; caption: string; preview: string }>>>;

  // Associates props
  associates: Array<{ firstName: string; lastName: string }>;
  setAssociates: (associates: Array<{ firstName: string; lastName: string }>) => void;

  // Anonymous review props
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;

}

const ReviewForm: React.FC<ReviewFormProps> = ({
  isEditing,
  isSubmitting,
  isChecking,
  onSubmit,
  customer,
  isNewCustomer,
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerNickname,
  setCustomerNickname,
  customerBusinessName,
  setCustomerBusinessName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customerCity,
  setCustomerCity,
  customerState,
  setCustomerState,
  customerZipCode,
  setCustomerZipCode,
  rating,
  setRating,
  hoverRating,
  setHoverRating,
  comment,
  setComment,
  photos,
  setPhotos,
  associates,
  setAssociates,
  isAnonymous,
  setIsAnonymous,
}) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/profile/business-reviews");
  };

  // Handle address component extraction from Google Maps
  const handleAddressComponentsExtracted = (components: AddressComponents) => {
    // Only update fields that are currently empty to avoid overwriting user input
    if (components.city && !customerCity) {
      setCustomerCity(components.city);
    }
    if (components.state && !customerState) {
      setCustomerState(components.state);
    }
    if (components.zipCode && !customerZipCode) {
      setCustomerZipCode(components.zipCode);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-6">
        {/* Customer Information */}
        <CustomerInfoForm
          customerFirstName={customerFirstName}
          customerLastName={customerLastName}
          customerNickname={customerNickname}
          customerBusinessName={customerBusinessName}
          customerPhone={customerPhone}
          customerAddress={customerAddress}
          customerCity={customerCity}
          customerState={customerState}
          customerZipCode={customerZipCode}
          isNewCustomer={isNewCustomer}
          customer={customer}
          setCustomerFirstName={setCustomerFirstName}
          setCustomerLastName={setCustomerLastName}
          setCustomerNickname={setCustomerNickname}
          setCustomerBusinessName={setCustomerBusinessName}
          setCustomerPhone={setCustomerPhone}
          setCustomerAddress={setCustomerAddress}
          setCustomerCity={setCustomerCity}
          setCustomerState={setCustomerState}
          setCustomerZipCode={setCustomerZipCode}
          onAddressComponentsExtracted={handleAddressComponentsExtracted}
        />

        {/* Anonymous Review Option */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
                Review Anonymously
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Your review will show your business type instead of your business name.
                <br />
                <strong>Note:</strong> Anonymous reviewers cannot participate in conversations until they uncheck this option in the edit review form.
              </p>
            </div>
          </div>
        </div>

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

        {/* Associates */}
        <AssociatesInput
          associates={associates}
          setAssociates={setAssociates}
        />

        <div className="pt-4 space-y-3">
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
          
          {/* Cancel link - only show when editing */}
          {isEditing && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default ReviewForm;
