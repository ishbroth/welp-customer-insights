
import { Customer } from "@/types/search";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCustomer, ReviewData } from "./types";
import { groupReviewsByCustomer } from "./reviewGrouping";

export const processProfileCustomers = async (profiles: ProfileCustomer[]): Promise<Customer[]> => {
  const customerIds = profiles.map(p => p.id);
  
  // Fetch reviews for these customers to get review counts and ratings
  let reviewsMap = new Map();
  if (customerIds.length > 0) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('customer_id, rating')
      .in('customer_id', customerIds);
    
    if (reviews) {
      reviews.forEach(review => {
        if (!reviewsMap.has(review.customer_id)) {
          reviewsMap.set(review.customer_id, []);
        }
        reviewsMap.get(review.customer_id).push(review);
      });
    }
  }
  
  return profiles.map(profile => {
    const customerReviews = reviewsMap.get(profile.id) || [];
    const averageRating = customerReviews.length > 0 
      ? customerReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / customerReviews.length 
      : 0;
    
    return {
      id: profile.id,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipcode,
      reviews: customerReviews.map((review: any) => ({
        id: review.id || `review-${Date.now()}-${Math.random()}`,
        reviewerId: 'unknown',
        reviewerName: 'Business Review',
        rating: review.rating,
        content: 'Review content not available',
        date: review.created_at || new Date().toISOString()
      })),
      totalReviews: customerReviews.length,
      averageRating
    };
  });
};

export const processReviewCustomers = (reviews: ReviewData[]): Customer[] => {
  console.log("=== PROCESSING REVIEW CUSTOMERS ===");
  console.log(`Input reviews: ${reviews.length}`);
  
  // Group reviews by customer before processing
  const groupedReviews = groupReviewsByCustomer(reviews);
  console.log(`Grouped into ${groupedReviews.length} unique customers`);
  
  return groupedReviews.map(groupedReview => {
    const customerId = `review-customer-${groupedReview.id}`;
    
    // Extract name parts
    const nameParts = (groupedReview.customer_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Convert all matching reviews to the expected review format
    const formattedReviews = groupedReview.matchingReviews.map(review => ({
      id: review.id,
      reviewerId: review.business_id || 'unknown',
      reviewerName: review.reviewerName || 'Business Review',
      rating: review.rating,
      content: review.content,
      date: review.created_at || new Date().toISOString(),
      reviewerVerified: review.reviewerVerified || false,
      customer_name: review.customer_name,
      customer_phone: review.customer_phone,
      customer_address: review.customer_address,
      customer_city: review.customer_city,
      customer_zipcode: review.customer_zipcode,
      customerId: customerId
    }));
    
    const customer: Customer = {
      id: customerId,
      firstName,
      lastName,
      phone: groupedReview.customer_phone,
      address: groupedReview.customer_address,
      city: groupedReview.customer_city,
      state: '', // Reviews don't typically have state info
      zipCode: groupedReview.customer_zipcode,
      reviews: formattedReviews,
      totalReviews: groupedReview.totalReviews,
      averageRating: groupedReview.averageRating
    };
    
    console.log(`Processed customer: ${firstName} ${lastName}, Reviews: ${groupedReview.totalReviews}, Avg Rating: ${groupedReview.averageRating.toFixed(1)}`);
    
    return customer;
  });
};
