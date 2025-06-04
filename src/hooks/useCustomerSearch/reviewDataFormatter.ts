
export const formatReviewData = (review: any) => {
  // Handle joined profiles data more robustly
  let businessName = "Unknown Business";
  let businessAvatar = "";
  
  // Check if profiles data was successfully joined
  if (review.profiles) {
    console.log(`formatReviewData: Profiles join successful for business ${review.business_id}:`, review.profiles);
    businessName = review.profiles.name || "Unknown Business";
    businessAvatar = review.profiles.avatar || "";
  } else {
    console.log(`formatReviewData: No profiles data found for business ${review.business_id}. This could indicate:
    1. The business_id doesn't exist in the profiles table
    2. The join syntax is incorrect
    3. The business profile was deleted`);
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
    // Use the business profile data from the join
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
