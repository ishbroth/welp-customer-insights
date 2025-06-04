
export const formatReviewData = (review: any) => {
  console.log("formatReviewData: Processing review:", review.id);
  
  // Get business name from multiple possible sources
  let businessName = "Unknown Business";
  let businessAvatar = null;
  
  if (review.profiles?.name) {
    businessName = review.profiles.name;
    businessAvatar = review.profiles.avatar;
    console.log("formatReviewData: Using profile name:", businessName);
  } else if (review.business_profile?.name) {
    businessName = review.business_profile.name;
    businessAvatar = review.business_profile.avatar;
    console.log("formatReviewData: Using business profile name:", businessName);
  } else {
    console.log("formatReviewData: No business profile found for business ID:", review.business_id);
  }

  console.log(`formatReviewData: Business ID ${review.business_id}, final business name: ${businessName}`);

  // Get customer avatar if available
  let customerAvatar = null;
  if (review.customer_profile?.avatar) {
    customerAvatar = review.customer_profile.avatar;
  }

  return {
    id: review.id,
    reviewerId: review.business_id,
    reviewerName: businessName,
    reviewerAvatar: businessAvatar,
    customerAvatar: customerAvatar,
    rating: review.rating,
    content: review.content,
    date: new Date(review.created_at).toISOString(),
    customer_name: review.customer_name,
    customer_phone: review.customer_phone,
    customer_address: review.customer_address,
    customer_city: review.customer_city,
    customer_zipcode: review.customer_zipcode,
    customerId: review.customer_id,
    business_profile: review.profiles || review.business_profile || null
  };
};
