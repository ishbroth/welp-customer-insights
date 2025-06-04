
import { Customer } from "@/types/search";

export const processProfileCustomers = async (profilesData: any[]): Promise<Customer[]> => {
  console.log("processProfileCustomers: Processing", profilesData.length, "profiles");
  
  return profilesData.map(profile => ({
    id: profile.id,
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    zipCode: profile.zipcode || "",
    avatar: profile.avatar || "",
    reviews: [] // Reviews will be populated separately if needed
  }));
};

export const processReviewCustomers = (reviewsData: any[]): Customer[] => {
  console.log("processReviewCustomers: Processing", reviewsData.length, "reviews");
  
  // Group reviews by customer identifier (name + phone or address)
  const customerMap = new Map<string, Customer>();
  
  reviewsData.forEach(review => {
    // Create a unique identifier for the customer
    const customerKey = `${review.firstName.toLowerCase()}_${review.lastName.toLowerCase()}_${review.customer_phone || review.customer_address || ''}`;
    
    const reviewItem = {
      id: review.id,
      reviewerId: review.business_id || review.reviewerId,
      reviewerName: review.reviewerName,
      rating: review.rating,
      content: review.content,
      date: review.date,
      reviewerVerified: review.reviewerVerified
    };

    console.log(`processReviewCustomers: Added review with verification status ${review.reviewerVerified} for business ${review.reviewerName}`);
    
    if (customerMap.has(customerKey)) {
      // Add review to existing customer
      const existingCustomer = customerMap.get(customerKey)!;
      existingCustomer.reviews = existingCustomer.reviews || [];
      existingCustomer.reviews.push(reviewItem);
    } else {
      // Create new customer
      const customer: Customer = {
        id: `review-customer-${review.id}`,
        firstName: review.firstName,
        lastName: review.lastName,
        phone: review.customer_phone || "",
        address: review.customer_address || "",
        city: review.customer_city || "",
        state: "", // Reviews don't have customer state
        zipCode: review.customer_zipcode || "",
        reviews: [reviewItem]
      };
      
      customerMap.set(customerKey, customer);
    }
  });
  
  return Array.from(customerMap.values());
};
