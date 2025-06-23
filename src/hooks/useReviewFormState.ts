
import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [photos, setPhotos] = useState<Array<{ file: File; caption: string; preview: string; isExisting?: boolean; existingId?: string }>>([]);
  
  // Duplicate review check states
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  // Function to convert URL to File object for existing photos
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  useEffect(() => {
    const initializeForm = async () => {
      console.log("useReviewFormState - isEditing:", isEditing, "reviewData:", reviewData, "reviewId:", reviewId);
      
      // Clear all form data first for new reviews
      if (!isEditing) {
        setRating(0);
        setComment("");
        setPhotos([]);
      }
      
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
        setCustomerCity(reviewData.city || "");
        setCustomerState(reviewData.state || "");
        setCustomerZipCode(reviewData.zipCode || "");

        // Load existing photos when editing
        if (reviewId) {
          try {
            const { data: existingPhotos, error } = await supabase
              .from('review_photos')
              .select('*')
              .eq('review_id', reviewId)
              .order('display_order');

            if (error) {
              console.error("Error fetching existing photos:", error);
            } else if (existingPhotos && existingPhotos.length > 0) {
              console.log("Loading existing photos:", existingPhotos);
              
              // Convert existing photos to the format expected by the form
              const photoPromises = existingPhotos.map(async (photo, index) => {
                try {
                  const file = await urlToFile(photo.photo_url, `photo-${index}.jpg`);
                  return {
                    file,
                    caption: photo.caption || "",
                    preview: photo.photo_url,
                    isExisting: true, // Mark as existing photo
                    existingId: photo.id
                  };
                } catch (error) {
                  console.error("Error converting photo to file:", error);
                  return null;
                }
              });

              const convertedPhotos = await Promise.all(photoPromises);
              const validPhotos = convertedPhotos.filter(photo => photo !== null);
              setPhotos(validPhotos as Array<{ file: File; caption: string; preview: string; isExisting?: boolean; existingId?: string }>);
            }
          } catch (error) {
            console.error("Error loading existing photos:", error);
          }
        }
      } else {
        // Pre-fill form with search parameters from URL if not editing
        setCustomerFirstName(searchParamFirstName);
        setCustomerLastName(searchParamLastName);
        setCustomerPhone(searchParamPhone);
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
    };

    initializeForm();
  }, [
    customerId, 
    isEditing, 
    reviewData, 
    reviewId,
    searchParamFirstName, 
    searchParamLastName, 
    searchParamPhone, 
    searchParamCity, 
    searchParamState,
    searchParamZipCode
  ]); // Removed all the setter functions from dependencies

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
