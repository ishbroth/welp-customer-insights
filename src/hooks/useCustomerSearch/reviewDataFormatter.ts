
export const formatReviewData = (review: any) => {
  // Extract business profile information
  const businessProfile = review.profiles || {};
  const customerProfile = review.customer_profile || {};
  
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
    customer_id: review.customer_id,
    business_profile: businessProfile,
    reviewerName: businessProfile?.business_name || businessProfile?.name || "Anonymous Business",
    reviewerAvatar: businessProfile?.avatar || "", // Include avatar from profile
    reviewerVerified: false, // This will be set in the search function
    customerVerified: customerProfile?.verified || false,
    searchScore: 0,
    matchCount: 0
  };
};
