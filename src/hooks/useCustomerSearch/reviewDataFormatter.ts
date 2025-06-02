
import { ReviewData } from "./types";

export const formatReviewData = (review: any): ReviewData => {
  // Properly format the business profile data
  const businessProfile = review.profiles ? {
    name: review.profiles.name || 'Unknown Business',
    avatar: review.profiles.avatar || undefined
  } : null;

  // Return the properly formatted review data with explicit verification handling
  const formattedReview: ReviewData = {
    id: review.id,
    customer_name: review.customer_name || '',
    customer_address: review.customer_address || '',
    customer_city: review.customer_city || '',
    customer_zipcode: review.customer_zipcode || '',
    customer_phone: review.customer_phone || '',
    rating: review.rating,
    business_id: review.business_id,
    business_profile: businessProfile,
    // Ensure reviewerVerified is explicitly set
    reviewerVerified: Boolean(review.reviewerVerified)
  };

  console.log(`formatReviewData: Setting reviewerVerified to ${formattedReview.reviewerVerified} for business ${businessProfile?.name}`);

  return formattedReview;
};
