
export const formatReviewData = (review: any) => {
  // Handle the business profile data
  let businessName = "Unknown Business";
  let businessAvatar = "";
  
  // The profile data should now be at review.profiles
  const businessProfile = review.profiles;
  
  if (businessProfile) {
    businessName = businessProfile.name || "Unknown Business";
    businessAvatar = businessProfile.avatar || "";
    console.log(`formatReviewData: Successfully extracted business name: ${businessName} for business ID: ${review.business_id}`);
  } else {
    console.log(`formatReviewData: No profiles data found for business ${review.business_id}`);
    console.log(`formatReviewData: Available review keys:`, Object.keys(review));
  }
  
  // Parse customer name
  const customerParts = (review.customer_name || "").split(' ');
  const firstName = customerParts[0] || "";
  const lastName = customerParts.slice(1).join(' ') || "";

  console.log(`formatReviewData: Business ID ${review.business_id}, final business name: ${businessName}`);

  return {
    id: review.id,
    customer_name: review.customer_name || "",
    customer_address: review.customer_address || "",
    customer_city: review.customer_city || "",
    customer_zipcode: review.customer_zipcode || "",
    customer_phone: review.customer_phone || "",
    rating: review.rating || 0,
    content: review.content || "",
    date: review.created_at || new Date().toISOString(),
    business_id: review.business_id,
    // Use the business profile data
    business_profile: {
      name: businessName,
      avatar: businessAvatar
    },
    // For Customer interface compatibility
    firstName,
    lastName,
    reviewerId: review.business_id,
    reviewerName: businessName,
    reviewerAvatar: businessAvatar,
    reviewerVerified: false // This will be set by the caller based on business_info
  };
};
