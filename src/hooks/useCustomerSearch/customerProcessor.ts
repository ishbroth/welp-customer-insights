
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/search";
import { ProfileCustomer, ReviewData } from "./types";

export const processProfileCustomers = async (profilesData: ProfileCustomer[]): Promise<Customer[]> => {
  if (!profilesData || profilesData.length === 0) return [];

  console.log("Processing profile customers...");
  
  // Get reviews for these profiles in a single query
  const profileIds = profilesData.map(profile => profile.id);
  const { data: profileReviews } = await supabase
    .from('reviews')
    .select('customer_id, rating')
    .in('customer_id', profileIds);
  
  const profileCustomers = profilesData.map(profile => {
    // Get all reviews for this profile
    const customerReviews = profileReviews?.filter(review => 
      review.customer_id === profile.id
    ) || [];
    
    // Calculate average rating
    const totalRating = customerReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = customerReviews.length > 0 
      ? totalRating / customerReviews.length 
      : 0;
    
    return {
      id: profile.id,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zipCode: profile.zipcode || '',
      averageRating,
      totalReviews: customerReviews.length,
      isSubscriptionNeeded: customerReviews.length > 0
    };
  });
  
  console.log("Profile customers processed:", profileCustomers);
  return profileCustomers;
};

export const processReviewCustomers = (reviewsData: ReviewData[], existingCustomers: Customer[]): Customer[] => {
  if (!reviewsData || reviewsData.length === 0) return [];

  console.log("Processing review customers...");
  // Group reviews by customer info to avoid duplicates
  const reviewsByCustomerInfo = new Map();
  
  reviewsData.forEach(review => {
    if (!review.customer_name) return;
    
    const customerKey = `${review.customer_name}|${review.customer_phone || ''}`;
    
    if (!reviewsByCustomerInfo.has(customerKey)) {
      reviewsByCustomerInfo.set(customerKey, {
        reviews: [review],
        ratings: [review.rating]
      });
    } else {
      const existing = reviewsByCustomerInfo.get(customerKey);
      existing.reviews.push(review);
      existing.ratings.push(review.rating);
      reviewsByCustomerInfo.set(customerKey, existing);
    }
  });
  
  const reviewCustomers: Customer[] = [];
  
  // Convert map to array of customers
  reviewsByCustomerInfo.forEach((value, key) => {
    const [name, phone] = key.split('|');
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Calculate average rating
    const totalRating = value.ratings.reduce((sum: number, rating: number) => sum + rating, 0);
    const averageRating = value.ratings.length > 0 
      ? totalRating / value.ratings.length 
      : 0;
      
    const sampleReview = value.reviews[0];
    
    // Create a unique ID for this customer from reviews
    const customerId = `review-customer-${sampleReview.id}`;
    
    // Check if this customer is already in our list from profiles
    const isDuplicate = existingCustomers.some(c => 
      (c.firstName === firstName && c.lastName === lastName) || 
      (phone && c.phone === phone)
    );
    
    if (!isDuplicate) {
      reviewCustomers.push({
        id: customerId,
        firstName,
        lastName,
        phone: sampleReview.customer_phone || '',
        address: sampleReview.customer_address || '',
        city: sampleReview.customer_city || '',
        state: '', // Reviews don't store state
        zipCode: sampleReview.customer_zipcode || '',
        averageRating,
        totalReviews: value.reviews.length,
        isSubscriptionNeeded: value.reviews.length > 0
      });
    }
  });
  
  console.log("Review customers processed, total new customers:", reviewCustomers.length);
  return reviewCustomers;
};
