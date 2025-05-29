
import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

export const useReviewFormState = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const customerId = searchParams.get("customerId");
  const isEditing = searchParams.get("edit") === "true";
  const reviewId = searchParams.get("reviewId");
  
  // Get search parameters for pre-filling the form
  const searchParamFirstName = searchParams.get("firstName") || "";
  const searchParamLastName = searchParams.get("lastName") || "";
  const searchParamPhone = searchParams.get("phone") || "";
  const searchParamAddress = searchParams.get("address") || "";
  const searchParamCity = searchParams.get("city") || "";
  const searchParamState = searchParams.get("state") || "";
  const searchParamZipCode = searchParams.get("zipCode") || "";
  
  const reviewData = location.state?.reviewData;
  
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
  const [customerState, setCustomerState] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [photos, setPhotos] = useState<Array<{ file: File; caption: string; preview: string }>>([]);
  
  // Duplicate review check states
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    console.log("useReviewFormState - isEditing:", isEditing, "reviewData:", reviewData);
    
    // Handle pre-filling data if we're editing
    if (isEditing && reviewData) {
      setRating(reviewData.rating);
      setComment(reviewData.content);
      
      const customerName = reviewData.customerName || "";
      const nameParts = customerName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      setCustomerFirstName(firstName);
      setCustomerLastName(lastName);
      setCustomerPhone(reviewData.phone || "");
      setCustomerAddress(reviewData.address || "");
      setCustomerCity(reviewData.city || "");
      setCustomerState(reviewData.state || "");
      setCustomerZipCode(reviewData.zipCode || "");
    } else {
      // Pre-fill form with search parameters from URL if not editing
      setCustomerFirstName(searchParamFirstName);
      setCustomerLastName(searchParamLastName);
      setCustomerPhone(searchParamPhone);
      setCustomerAddress(searchParamAddress);
      setCustomerCity(searchParamCity);
      setCustomerState(searchParamState);
      setCustomerZipCode(searchParamZipCode);
    }
    
    if (customerId) {
      setIsLoading(true);
      setTimeout(() => {
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
    searchParamState,
    searchParamZipCode
  ]);

  return {
    // URL params
    customerId,
    isEditing,
    reviewId,
    
    // Form state
    customer,
    setCustomer,
    isLoading,
    setIsLoading,
    rating,
    setRating,
    hoverRating,
    setHoverRating,
    comment,
    setComment,
    customerFirstName,
    setCustomerFirstName,
    customerLastName,
    setCustomerLastName,
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
    isNewCustomer,
    setIsNewCustomer,
    photos,
    setPhotos,
    
    // Duplicate dialog state
    showDuplicateDialog,
    setShowDuplicateDialog,
    existingReview,
    setExistingReview,
  };
};
