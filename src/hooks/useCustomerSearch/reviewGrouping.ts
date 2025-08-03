import { calculateStringSimilarity } from "@/utils/stringSimilarity";
import { compareAddresses } from "@/utils/addressNormalization";
import { ReviewData } from "./types";

interface GroupedReview extends ReviewData {
  matchingReviews: ReviewData[];
  averageRating: number;
  totalReviews: number;
}

// Function to determine if two reviews are about the same customer
const areReviewsForSameCustomer = (review1: ReviewData, review2: ReviewData): boolean => {
  // Debug logging for Isaac Wiley issue
  const name1 = review1.customer_name?.toLowerCase().trim() || '';
  const name2 = review2.customer_name?.toLowerCase().trim() || '';
  
  if (name1.includes('isaac') || name2.includes('isaac')) {
    console.log(`🔍 Comparing Isaac reviews:`, {
      review1: {
        id: review1.id,
        name: review1.customer_name,
        phone: review1.customer_phone,
        address: review1.customer_address,
        zip: review1.customer_zipcode
      },
      review2: {
        id: review2.id,
        name: review2.customer_name,
        phone: review2.customer_phone,
        address: review2.customer_address,
        zip: review2.customer_zipcode
      }
    });
  }
  
  // Clean phone numbers for comparison
  const cleanPhone1 = review1.customer_phone ? review1.customer_phone.replace(/\D/g, '') : '';
  const cleanPhone2 = review2.customer_phone ? review2.customer_phone.replace(/\D/g, '') : '';
  
  // Check if phones match (if both exist) - this is a strong indicator
  const phoneMatch = cleanPhone1 && cleanPhone2 && (
    cleanPhone1 === cleanPhone2 ||
    cleanPhone1.includes(cleanPhone2.slice(-7)) ||
    cleanPhone2.includes(cleanPhone1.slice(-7))
  );
  
  // Check if names are similar (if both exist)
  const nameMatch = name1 && name2 && (
    calculateStringSimilarity(name1, name2) > 0.7 || // Lowered threshold for better matching
    name1 === name2
  );
  
  // Check if addresses are similar using the new address comparison (if both exist)
  const address1 = review1.customer_address || '';
  const address2 = review2.customer_address || '';
  const addressMatch = address1 && address2 && (
    compareAddresses(address1, address2, 0.8) ||
    compareAddresses(address1, address2, 0.6) // More lenient fallback
  );
  
  // Check if zip codes match (if both exist)
  const zip1 = review1.customer_zipcode?.replace(/\D/g, '') || '';
  const zip2 = review2.customer_zipcode?.replace(/\D/g, '') || '';
  const zipMatch = zip1 && zip2 && zip1 === zip2;
  
  // Debug logging for Isaac Wiley matching
  if (name1.includes('isaac') || name2.includes('isaac')) {
    console.log(`🔍 Isaac matching results:`, {
      nameMatch,
      nameSimilarity: name1 && name2 ? calculateStringSimilarity(name1, name2) : 0,
      phoneMatch,
      addressMatch,
      zipMatch,
      cleanPhone1,
      cleanPhone2,
      address1,
      address2
    });
  }
  
  // NEW LOGIC: Group reviews if ANY strong matching criteria is met
  // Phone match alone is sufficient (strong identifier)
  if (phoneMatch) {
    console.log(`Phone match found between reviews: ${cleanPhone1}`);
    return true;
  }
  
  // EXACT NAME + ZIP match is sufficient (for cases like Isaac Wiley)
  if (name1 === name2 && zipMatch) {
    console.log(`Exact name + zip match found: ${name1} in ${zip1}`);
    return true;
  }
  
  // Address + zip match is sufficient (location-based matching)
  if (addressMatch && zipMatch) {
    console.log(`Address + zip match found: ${address1} in ${zip1}`);
    return true;
  }
  
  // Name + address match is sufficient
  if (nameMatch && addressMatch) {
    console.log(`Name + address match found: ${name1} at ${address1}`);
    return true;
  }
  
  // Name + zip match is sufficient (for similar names)
  if (nameMatch && zipMatch) {
    console.log(`Name + zip match found: ${name1} in ${zip1}`);
    return true;
  }
  
  // Name + phone match is sufficient
  if (nameMatch && phoneMatch) {
    console.log(`Name + phone match found: ${name1} with ${cleanPhone1}`);
    return true;
  }
  
  return false;
};

// Function to merge customer data from multiple reviews
const mergeCustomerData = (reviews: ReviewData[]): Partial<ReviewData> => {
  // Sort reviews by date (newest first) to prioritize more recent information
  const sortedReviews = [...reviews].sort((a, b) => 
    new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  );
  
  // Take the most complete and recent information
  const merged: Partial<ReviewData> = {};
  
  // Use the first non-empty value for each field, prioritizing newer reviews
  for (const review of sortedReviews) {
    if (!merged.customer_name && review.customer_name) {
      merged.customer_name = review.customer_name;
    }
    if (!merged.customer_phone && review.customer_phone) {
      merged.customer_phone = review.customer_phone;
    }
    if (!merged.customer_address && review.customer_address) {
      merged.customer_address = review.customer_address;
    }
    if (!merged.customer_city && review.customer_city) {
      merged.customer_city = review.customer_city;
    }
    if (!merged.customer_zipcode && review.customer_zipcode) {
      merged.customer_zipcode = review.customer_zipcode;
    }
  }
  
  return merged;
};

export const groupReviewsByCustomer = (reviews: ReviewData[]): GroupedReview[] => {
  const groupedReviews: GroupedReview[] = [];
  const processedReviewIds = new Set<string>();
  
  console.log(`Starting review grouping for ${reviews.length} reviews`);
  
  for (const review of reviews) {
    // Skip if this review has already been processed
    if (processedReviewIds.has(review.id)) {
      continue;
    }
    
    // Find all reviews that match this customer
    const matchingReviews = reviews.filter(otherReview => 
      !processedReviewIds.has(otherReview.id) && 
      (otherReview.id === review.id || areReviewsForSameCustomer(review, otherReview))
    );
    
    // Mark all matching reviews as processed
    matchingReviews.forEach(r => processedReviewIds.add(r.id));
    
    // Calculate average rating
    const totalRating = matchingReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / matchingReviews.length;
    
    // Merge customer data from all matching reviews
    const mergedCustomerData = mergeCustomerData(matchingReviews);
    
    // Create grouped review using the most recent review as base
    const mostRecentReview = matchingReviews.sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )[0];
    
    const groupedReview: GroupedReview = {
      ...mostRecentReview,
      ...mergedCustomerData,
      matchingReviews,
      averageRating,
      totalReviews: matchingReviews.length,
      // Update the rating to be the average
      rating: averageRating
    };
    
    console.log(`Grouped ${matchingReviews.length} reviews for customer: ${mergedCustomerData.customer_name || 'Unknown'}, Phone: ${mergedCustomerData.customer_phone || 'N/A'}, Address: ${mergedCustomerData.customer_address || 'N/A'}, Average rating: ${averageRating.toFixed(1)}`);
    
    groupedReviews.push(groupedReview);
  }
  
  console.log(`Review grouping complete: ${reviews.length} reviews grouped into ${groupedReviews.length} customers`);
  
  return groupedReviews;
};
