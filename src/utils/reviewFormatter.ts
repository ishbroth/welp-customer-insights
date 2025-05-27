
export const formatReview = (review: any, currentUser: any) => {
  return {
    id: review.id,
    rating: review.rating,
    content: review.content,
    date: review.created_at,
    reviewerId: review.business_id,
    reviewerName: review.business_profile?.name || "Business",
    reviewerAvatar: review.business_profile?.avatar || "",
    customerId: currentUser?.id || review.customer_id,
    customerName: currentUser?.name || review.customer_name || "Customer",
    reactions: {
      like: [],
      funny: [],
      ohNo: []
    },
    responses: review.responses || []
  };
};
