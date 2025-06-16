
export const formatReview = (review: any, currentUser: any) => {
  console.log("formatReview: Processing review", review.id, "with business profile:", review.business_profile);
  
  // Extract business info from either business_profile or the review data itself
  const businessName = review.business_profile?.name || 
                      review.reviewerName || 
                      review.customer_name || 
                      'Business';
  
  const businessAvatar = review.business_profile?.avatar || 
                        review.reviewerAvatar || 
                        '';

  const formattedReview = {
    id: review.id,
    reviewerId: review.business_id || review.reviewerId || '',
    reviewerName: businessName,
    reviewerAvatar: businessAvatar,
    reviewerVerified: review.reviewerVerified || false,
    customerId: review.customer_id || currentUser?.id || '',
    customerName: review.customer_name || currentUser?.name || 'Customer',
    customerAvatar: review.customerAvatar || '',
    customer_phone: review.customer_phone || '',
    customer_address: review.customer_address || '',
    customer_city: review.customer_city || '',
    customer_zipcode: review.customer_zipcode || '',
    rating: review.rating || 0,
    content: review.content || '',
    date: review.created_at || review.date || new Date().toISOString(),
    address: review.customer_address || '',
    city: review.customer_city || '',
    zipCode: review.customer_zipcode || '',
    reactions: review.reactions || { like: [], funny: [], useful: [], ohNo: [] },
    responses: review.responses || [],
    // Pass through match data for customer reviews
    matchType: review.matchType,
    matchScore: review.matchScore,
    matchReasons: review.matchReasons,
    detailedMatches: review.detailedMatches,
    isNewReview: review.isNewReview,
    isClaimed: review.isClaimed
  };

  console.log("formatReview: Formatted review:", {
    id: formattedReview.id,
    businessName: formattedReview.reviewerName,
    businessAvatar: formattedReview.reviewerAvatar,
    customerName: formattedReview.customerName
  });

  return formattedReview;
};
