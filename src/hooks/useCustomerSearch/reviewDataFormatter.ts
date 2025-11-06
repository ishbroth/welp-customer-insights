
export const formatReviewData = (review: any) => {
  // Extract business profile information
  const businessProfile = review.profiles || {};
  const customerProfile = review.customer_profile || {};

  // Always use the actual customer name from the review
  // For associate matches, this is the associate's name (the person being reviewed)
  // The associateData field contains the search target's name for "Found via associate:" display

  return {
    id: review.id,
    customer_name: review.customer_name, // Keep original for search/scoring
    customerName: review.customer_name,  // Use for UI display - always the actual customer being reviewed
    customer_nickname: review.customer_nickname, // Include nickname
    customer_business_name: review.customer_business_name, // Include business name
    customer_address: review.customer_address,
    customer_city: review.customer_city,
    customer_zipcode: review.customer_zipcode,
    customer_phone: review.customer_phone,
    associates: review.associates, // Include associates
    is_anonymous: review.is_anonymous, // Include anonymous flag
    rating: review.rating,
    content: review.content,
    created_at: review.created_at,
    business_id: review.business_id,
    customer_id: review.customer_id,
    business_profile: businessProfile,
    reviewerName: businessProfile?.business_name || businessProfile?.name || "Anonymous Business",
    reviewerAvatar: businessProfile?.avatar || "", // Include avatar from profile
    reviewerVerified: businessProfile?.verified || false, // Get verified status from profile
    reviewerBusinessCategory: businessProfile?.business_category || "", // Include business category
    reviewerCity: businessProfile?.city || "", // Include business city
    reviewerState: businessProfile?.business_state || businessProfile?.state || "", // Include business state
    customerVerified: customerProfile?.verified || false,
    searchScore: 0,
    matchCount: 0,
    // Pass through associate match metadata
    isAssociateMatch: review.isAssociateMatch,
    associateData: review.associateData,
    original_customer_name: review.original_customer_name
  };
};
