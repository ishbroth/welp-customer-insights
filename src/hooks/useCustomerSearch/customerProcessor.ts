
import { ReviewData, ProfileCustomer } from "./types";
import { Customer } from "@/types/search";

export const processProfileCustomers = async (profiles: ProfileCustomer[]): Promise<Customer[]> => {
  console.log("Processing profile customers...");
  
  const customers = profiles.map(profile => {
    const customer: Customer = {
      id: profile.id,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zipCode: profile.zipcode || '',
      averageRating: 0,
      totalReviews: 0,
      isSubscriptionNeeded: false,
      businessProfile: null
    };
    
    return customer;
  });

  console.log("Profile customers processed, total customers:", customers.length);
  return customers;
};

export const processReviewCustomers = (reviews: ReviewData[]): Customer[] => {
  console.log("Processing review customers...");
  
  const customerMap = new Map<string, Customer>();

  reviews.forEach(review => {
    const customerKey = `${review.customer_name || ''}_${review.customer_phone || ''}_${review.customer_address || ''}`.toLowerCase();
    
    if (customerMap.has(customerKey)) {
      // Update existing customer
      const existingCustomer = customerMap.get(customerKey)!;
      existingCustomer.totalReviews += 1;
      existingCustomer.averageRating = (existingCustomer.averageRating + review.rating) / 2;
    } else {
      // Create new customer from review
      const nameParts = (review.customer_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const customer: Customer = {
        id: `review-customer-${review.id}`,
        firstName,
        lastName,
        phone: review.customer_phone || '',
        address: review.customer_address || '',
        city: review.customer_city || '',
        state: '',
        zipCode: review.customer_zipcode || '',
        averageRating: review.rating,
        totalReviews: 1,
        isSubscriptionNeeded: true,
        // Include the business profile data for proper display
        businessProfile: review.business_profile || null
      };
      
      customerMap.set(customerKey, customer);
    }
  });

  const customers = Array.from(customerMap.values());
  console.log("Review customers processed, total new customers:", customers.length);
  
  return customers;
};
