
import { Customer } from "@/types/search";
import { ProfileCustomer, ReviewData } from "./types";

export const processProfileCustomers = async (profilesData: ProfileCustomer[]): Promise<Customer[]> => {
  return profilesData.map(profile => ({
    id: profile.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    zipCode: profile.zipcode || '',
    reviews: []
  }));
};

export const processReviewCustomers = (reviewsData: ReviewData[]): Customer[] => {
  const customerMap = new Map<string, Customer>();

  reviewsData.forEach(review => {
    const customerKey = `${review.customer_name}-${review.customer_phone || review.customer_address}`;
    
    if (!customerMap.has(customerKey)) {
      // Parse customer name
      const nameParts = review.customer_name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      customerMap.set(customerKey, {
        id: `review-customer-${review.id}`,
        firstName,
        lastName,
        phone: review.customer_phone || '',
        address: review.customer_address || '',
        city: review.customer_city || '',
        state: '', // Reviews don't have customer state
        zipCode: review.customer_zipcode || '',
        reviews: []
      });
    }

    const customer = customerMap.get(customerKey)!;
    
    // Add review with proper verification status - use the value from reviewData
    customer.reviews!.push({
      id: review.id,
      reviewerId: review.business_id,
      reviewerName: review.business_profile?.name || 'Unknown Business',
      rating: review.rating,
      content: '', // Content will be fetched when needed
      date: new Date().toISOString(), // Default date, should be from review data
      reviewerVerified: review.reviewerVerified // Use the verification status from reviewData
    });

    console.log(`processReviewCustomers: Added review with verification status ${review.reviewerVerified} for business ${review.business_profile?.name}`);
  });

  return Array.from(customerMap.values());
};
