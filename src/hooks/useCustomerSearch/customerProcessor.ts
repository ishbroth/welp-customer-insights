
import { Customer } from "@/types/search";
import { ReviewData } from "./types";

export const processProfileCustomers = async (profilesData: any[]): Promise<Customer[]> => {
  console.log("Processing profile customers:", profilesData.length);
  
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
    verified: profile.verified || false,
    reviews: [] // Profile customers don't have reviews attached directly
  }));
};

export const processReviewCustomers = (reviewsData: ReviewData[]): Customer[] => {
  console.log("Processing review customers:", reviewsData.length);
  
  // Group reviews by customer identity (name + phone combination for better accuracy)
  const customerGroups = new Map<string, ReviewData[]>();
  
  reviewsData.forEach(review => {
    if (!review.customer_name) return;
    
    // Create a more sophisticated grouping key
    const phone = review.customer_phone?.replace(/\D/g, '') || '';
    const name = review.customer_name.toLowerCase().trim();
    
    // Use name + phone if phone exists, otherwise just name + address
    let groupKey: string;
    if (phone) {
      groupKey = `${name}|${phone}`;
    } else {
      const address = review.customer_address?.toLowerCase().trim() || '';
      const city = review.customer_city?.toLowerCase().trim() || '';
      groupKey = `${name}|${address}|${city}`;
    }
    
    if (!customerGroups.has(groupKey)) {
      customerGroups.set(groupKey, []);
    }
    customerGroups.get(groupKey)!.push(review);
  });
  
  console.log(`Grouped ${reviewsData.length} reviews into ${customerGroups.size} customer groups`);
  
  // Convert groups to Customer objects
  const customers: Customer[] = [];
  
  customerGroups.forEach((reviews, groupKey) => {
    // Use the most complete information from all reviews for this customer
    const mostCompleteReview = reviews.reduce((best, current) => {
      const currentCompleteness = [
        current.customer_name,
        current.customer_phone,
        current.customer_address,
        current.customer_city,
        current.customer_zipcode
      ].filter(Boolean).length;
      
      const bestCompleteness = [
        best.customer_name,
        best.customer_phone,
        best.customer_address,
        best.customer_city,
        best.customer_zipcode
      ].filter(Boolean).length;
      
      return currentCompleteness > bestCompleteness ? current : best;
    });
    
    // Parse the customer name
    const fullName = mostCompleteReview.customer_name || "";
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    
    // Create customer with enhanced review data that includes ALL customer info
    const customer: Customer = {
      id: `review-customer-${mostCompleteReview.id}`,
      firstName,
      lastName,
      phone: mostCompleteReview.customer_phone || "",
      address: mostCompleteReview.customer_address || "",
      city: mostCompleteReview.customer_city || "",
      state: "", // State comes from business profile, not customer data
      zipCode: mostCompleteReview.customer_zipcode || "",
      avatar: "",
      verified: false,
      reviews: reviews.map(review => ({
        id: review.id,
        reviewerId: review.business_id || "",
        reviewerName: review.reviewerName || "Unknown Business",
        reviewerAvatar: review.reviewerAvatar || "",
        rating: review.rating || 0,
        content: review.content || "",
        date: review.created_at || "",
        reviewerVerified: review.reviewerVerified || false,
        // CRITICAL: Include ALL customer information in each review
        // This ensures it's visible in search results regardless of auth status
        customer_phone: review.customer_phone,
        customer_address: review.customer_address,
        customer_city: review.customer_city,
        customer_zipcode: review.customer_zipcode
      }))
    };
    
    customers.push(customer);
  });
  
  console.log("Processed review customers:", customers.length);
  return customers;
};
