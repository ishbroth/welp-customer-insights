
export const formatReview = (review: any, currentUser: any) => {
  return {
    id: review.id,
    reviewerId: review.business_id,
    reviewerName: review.business_profile?.name || "Unknown Business",
    reviewerAvatar: review.business_profile?.avatar || "",
    reviewerVerified: review.business_profile?.verified || false,
    customerId: review.customer_id || currentUser?.id,
    customerName: review.customer_name || currentUser?.name,
    rating: review.rating,
    content: review.content,
    date: review.created_at,
    address: review.customer_address || "",
    city: review.customer_city || "",
    zipCode: review.customer_zipcode || "",
    customer_phone: review.customer_phone || "",
    reactions: { like: [], funny: [], useful: [], ohNo: [] },
    responses: review.responses || [],
    
    // Enhanced matching data
    matchType: review.matchType,
    matchScore: review.matchScore,
    matchReasons: review.matchReasons,
    isClaimed: review.matchType === 'claimed',
    isNewReview: review.isNewReview || false
  };
};
