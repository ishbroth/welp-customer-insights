
import { Customer } from "@/types/search";
import { ReviewData, SearchParams } from "./types";
import { groupReviewsByCustomer } from "./reviewGrouping";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

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

export const processReviewCustomers = (reviewsData: ReviewData[], searchParams?: SearchParams): Customer[] => {
  console.log("Processing review customers:", reviewsData.length);
  
  // Use advanced grouping to consolidate similar customer names
  const groupedReviews = groupReviewsByCustomer(reviewsData);
  console.log(`Advanced grouping: ${reviewsData.length} reviews grouped into ${groupedReviews.length} customer groups`);
  
  // Check if search has names for conditional sorting
  const hasNameSearch = searchParams?.firstName?.trim() || searchParams?.lastName?.trim();
  
  // Convert grouped reviews to Customer objects
  const customers: Customer[] = groupedReviews.map(groupedReview => {
    // Parse the customer name
    const fullName = groupedReview.customer_name || "";
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    
    // Sort reviews within the group by date (newest first)
    const sortedReviews = groupedReview.matchingReviews.sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
    
    // Create customer with enhanced review data
    const customer: Customer = {
      id: `review-customer-${groupedReview.id}`,
      firstName,
      lastName,
      phone: groupedReview.customer_phone || "",
      address: groupedReview.customer_address || "",
      city: groupedReview.customer_city || "",
      state: "", // State comes from business profile, not customer data
      zipCode: groupedReview.customer_zipcode || "",
      avatar: "",
      verified: false,
      reviews: sortedReviews.map(review => ({
        id: review.id,
        reviewerId: review.business_id || "",
        reviewerName: review.reviewerName || "Unknown Business",
        reviewerAvatar: review.reviewerAvatar || "",
        rating: review.rating || 0,
        content: review.content || "",
        date: review.created_at || "",
        reviewerVerified: review.reviewerVerified || false,
        // CRITICAL: Include ALL customer information in each review
        customer_phone: review.customer_phone,
        customer_address: review.customer_address,
        customer_city: review.customer_city,
        customer_zipcode: review.customer_zipcode
      }))
    };
    
    return customer;
  });
  
  // Apply conditional sorting based on search type
  const sortedCustomers = customers.sort((a, b) => {
    if (!hasNameSearch) {
      // For searches WITHOUT names: Sort alphabetically by customer name
      const aName = `${a.firstName} ${a.lastName}`.toLowerCase().trim();
      const bName = `${b.firstName} ${b.lastName}`.toLowerCase().trim();
      
      if (aName && bName && aName !== bName) {
        return aName.localeCompare(bName);
      }
    }
    // For searches WITH names: Reviews are already sorted by date within groups
    // Customer order will be determined by the search scoring system
    
    return 0;
  });
  
  console.log("Processed review customers:", sortedCustomers.length);
  return sortedCustomers;
};
