
export const formatReviewData = (review: any) => {
  // Get business name from the joined profiles data, with fallback
  const businessName = review.profiles?.name || "Unknown Business";
  
  // Parse customer name
  const customerParts = (review.customer_name || "").split(' ');
  const firstName = customerParts[0] || "";
  const lastName = customerParts.slice(1).join(' ') || "";

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
      avatar: review.profiles?.avatar || ""
    },
    // For Customer interface compatibility
    firstName,
    lastName,
    reviewerId: review.business_id,
    reviewerName: businessName,
    reviewerAvatar: review.profiles?.avatar || "",
    reviewerVerified: false // This will be set by the caller based on business_info
  };
};
