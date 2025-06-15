
import { Customer } from "@/types/search";

export const processProfileCustomers = async (profilesData: any[]): Promise<Customer[]> => {
  console.log("Processing profile customers:", profilesData.length);
  
  return profilesData.map(profile => ({
    id: profile.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    zipCode: profile.zipcode || '',
    avatar: profile.avatar || '',
    verified: profile.verified || false, // Include verification status
    reviews: [] // Will be populated separately if needed
  }));
};

export const processReviewCustomers = (reviewsData: any[]): Customer[] => {
  console.log("Processing review customers:", reviewsData.length);
  
  // Group reviews by customer identifier (name + phone combination)
  const customerGroups = new Map<string, any[]>();
  
  reviewsData.forEach(review => {
    if (!review.customer_name) return;
    
    // Create a key based on customer name and phone (if available)
    const customerKey = `${review.customer_name.toLowerCase()}-${(review.customer_phone || '').replace(/\D/g, '')}`;
    
    if (!customerGroups.has(customerKey)) {
      customerGroups.set(customerKey, []);
    }
    customerGroups.get(customerKey)!.push(review);
  });
  
  // Convert groups to Customer objects
  const customers: Customer[] = [];
  
  customerGroups.forEach((reviews, customerKey) => {
    const firstReview = reviews[0];
    const nameParts = firstReview.customer_name.split(' ');
    
    // Extract customer verification status from the first review's customer profile
    const customerVerified = firstReview.customer_profile?.verified || false;
    
    const customer: Customer = {
      id: `review-customer-${firstReview.id}`, // Use first review's ID as base
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: firstReview.customer_phone || '',
      address: firstReview.customer_address || '',
      city: firstReview.customer_city || '',
      state: '', // Not typically available in review data
      zipCode: firstReview.customer_zipcode || '',
      avatar: firstReview.customer_profile?.avatar || '',
      verified: customerVerified, // Include customer verification status
      reviews: reviews.map(review => ({
        id: review.id,
        reviewerId: review.business_id,
        reviewerName: review.reviewerName,
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        reviewerVerified: review.reviewerVerified || false
      }))
    };
    
    customers.push(customer);
    console.log(`Created customer from reviews: ${customer.firstName} ${customer.lastName}, Verified: ${customer.verified}, Reviews: ${customer.reviews?.length}`);
  });
  
  return customers;
};
