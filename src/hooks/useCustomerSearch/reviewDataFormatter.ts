
import { ReviewData } from "./types";

export const formatReviewData = (review: any): ReviewData => {
  console.log("formatReviewData: Processing review:", review.id);
  
  // Extract business profile data
  let businessProfile = null;
  let businessName = "Unknown Business";
  
  if (review.profiles) {
    businessProfile = review.profiles;
    businessName = review.profiles.name || "Unknown Business";
    console.log(`formatReviewData: Successfully extracted business name: ${businessName} for business ID: ${review.business_id}`);
  } else {
    console.log(`formatReviewData: No business profile found for business ID: ${review.business_id}`);
  }
  
  console.log(`formatReviewData: Business ID ${review.business_id}, final business name: ${businessName}`);
  
  return {
    id: review.id,
    customer_name: review.customer_name,
    customer_address: review.customer_address,
    customer_city: review.customer_city,
    customer_zipcode: review.customer_zipcode,
    customer_phone: review.customer_phone,
    rating: review.rating,
    content: review.content,
    created_at: review.created_at,
    business_id: review.business_id,
    reviewerName: businessName,
    reviewerAvatar: businessProfile?.avatar || "",
    reviewerVerified: review.reviewerVerified || false,
    business_profile: businessProfile // Include full business profile for state matching
  };
};
