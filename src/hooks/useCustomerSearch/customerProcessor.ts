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
  
  const customerMap = new Map<string, Customer & { reviews: any[] }>();

  reviews.forEach(review => {
    console.log("Processing review with business profile:", review.business_profile);
    
    const customerKey = `${review.customer_name || ''}_${review.customer_phone || ''}_${review.customer_address || ''}`.toLowerCase();
    
    // Create the review object that will be attached to the customer
    const reviewObject = {
      id: review.id,
      reviewerId: review.business_id,
      reviewerName: review.business_profile?.name || "The Painted Painter",
      rating: review.rating,
      content: "", // Content will be loaded when expanded
      date: new Date().toISOString(), // We'll use current date as placeholder
      reviewerVerified: (review as any).reviewerVerified || false, // Pass through verification status
      reviewerAvatar: review.business_profile?.avatar || ""
    };
    
    if (customerMap.has(customerKey)) {
      // Update existing customer
      const existingCustomer = customerMap.get(customerKey)!;
      existingCustomer.totalReviews += 1;
      existingCustomer.averageRating = (existingCustomer.averageRating + review.rating) / 2;
      existingCustomer.reviews.push(reviewObject);
    } else {
      // Create new customer from review
      const nameParts = (review.customer_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const customer = {
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
        businessProfile: review.business_profile,
        reviews: [reviewObject]
      };
      
      console.log("Created customer with business profile:", customer.businessProfile);
      customerMap.set(customerKey, customer);
    }
  });

  // Convert to the expected Customer type (without reviews property in the interface)
  const customers: Customer[] = Array.from(customerMap.values()).map(customer => {
    const { reviews, ...customerWithoutReviews } = customer;
    // Store reviews in a way that can be accessed by the customer card
    (customerWithoutReviews as any).reviews = reviews;
    return customerWithoutReviews;
  });
  
  console.log("Review customers processed, total new customers:", customers.length);
  console.log("Sample customer with reviews:", customers[0] ? (customers[0] as any).reviews : undefined);
  
  return customers;
};
