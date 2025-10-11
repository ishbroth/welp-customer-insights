
import { Customer } from "@/types/search";
import { ReviewData } from "./types";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('CustomerProcessor');

export const processProfileCustomers = async (profilesData: any[]): Promise<Customer[]> => {
  hookLogger.debug("Processing profile customers:", profilesData.length);
  
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
  hookLogger.debug("Processing review customers:", reviewsData.length);

  // Group reviews by customer identity - prioritize exact name matches
  const customerGroups = new Map<string, ReviewData[]>();

  reviewsData.forEach(review => {
    if (!review.customer_name) return;

    const name = review.customer_name.toLowerCase().trim();
    const phone = review.customer_phone?.replace(/\D/g, '') || '';
    const address = review.customer_address?.toLowerCase().trim() || '';
    const city = review.customer_city?.toLowerCase().trim() || '';

    // Check if we already have a group with this exact name
    let foundExistingGroup = false;
    for (const [existingKey, existingReviews] of customerGroups.entries()) {
      const existingName = existingReviews[0].customer_name.toLowerCase().trim();

      // If names match exactly, check if we should group them together
      if (existingName === name) {
        const existingPhone = existingReviews[0].customer_phone?.replace(/\D/g, '') || '';
        const existingAddress = existingReviews[0].customer_address?.toLowerCase().trim() || '';
        const existingCity = existingReviews[0].customer_city?.toLowerCase().trim() || '';

        // Group together if: same phone, OR same address+city, OR both have no phone/address
        const phoneMatch = phone && existingPhone && phone === existingPhone;
        const addressMatch = address && existingAddress && city && existingCity &&
                           address === existingAddress && city === existingCity;
        const bothMissingInfo = !phone && !existingPhone && !address && !existingAddress;

        if (phoneMatch || addressMatch || bothMissingInfo) {
          customerGroups.get(existingKey)!.push(review);
          foundExistingGroup = true;
          break;
        }
      }
    }

    // If no existing group found, create a new one
    if (!foundExistingGroup) {
      let groupKey: string;
      if (phone) {
        groupKey = `${name}|${phone}`;
      } else if (address && city) {
        groupKey = `${name}|${address}|${city}`;
      } else {
        groupKey = `${name}|${Math.random()}`; // Fallback to prevent collisions
      }

      customerGroups.set(groupKey, [review]);
    }
  });

  hookLogger.debug(`Grouped ${reviewsData.length} reviews into ${customerGroups.size} customer groups`);
  
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
    
    // For associate matches, use associate name and preserve original customer data
    const isAssociateMatch = mostCompleteReview.isAssociateMatch || false;
    let finalFirstName = firstName;
    let finalLastName = lastName;
    let finalPhone = mostCompleteReview.customer_phone || "";
    let finalAddress = mostCompleteReview.customer_address || "";
    let finalCity = mostCompleteReview.customer_city || "";
    let finalZipCode = mostCompleteReview.customer_zipcode || "";

    hookLogger.debug(`Processing review customer: ${fullName}, isAssociateMatch: ${isAssociateMatch}`);
    hookLogger.debug("🔍 CUSTOMER PROCESSOR - Original review data:", {
      associates: mostCompleteReview.associates,
      customer_business_name: mostCompleteReview.customer_business_name,
      customer_nickname: mostCompleteReview.customer_nickname
    });

    if (isAssociateMatch && mostCompleteReview.associateData) {
      // Use associate name for display
      finalFirstName = mostCompleteReview.associateData.firstName || "";
      finalLastName = mostCompleteReview.associateData.lastName || "";

      // For associate matches, we keep the original customer location data
      // since the associate doesn't have their own location data
      hookLogger.debug(`Associate match: Using ${finalFirstName} ${finalLastName} with original customer location`);
    }

    // Create customer with enhanced review data that includes ALL customer info
    const customer: Customer = {
      id: `review-customer-${mostCompleteReview.id}`,
      firstName: finalFirstName,
      lastName: finalLastName,
      phone: finalPhone,
      address: finalAddress,
      city: finalCity,
      state: "", // State comes from business profile, not customer data
      zipCode: finalZipCode,
      avatar: "",
      verified: false,
      // Associate match metadata
      isAssociateMatch,
      associateData: mostCompleteReview.associateData,
      originalCustomerInfo: isAssociateMatch ? {
        name: mostCompleteReview.original_customer_name,
        phone: mostCompleteReview.original_customer_phone,
        address: mostCompleteReview.original_customer_address,
        city: mostCompleteReview.original_customer_city,
        zipCode: mostCompleteReview.original_customer_zipcode
      } : undefined,
      reviews: reviews.map(review => ({
        id: review.id,
        reviewerId: review.business_id || "",
        reviewerName: review.reviewerName || "Unknown Business",
        reviewerAvatar: review.reviewerAvatar || "",
        reviewerBusinessCategory: review.reviewerBusinessCategory || "",
        rating: review.rating || 0,
        content: review.content || "",
        date: review.created_at || "",
        reviewerVerified: review.reviewerVerified || false,
        is_anonymous: review.is_anonymous || false,
        // CRITICAL: Include ALL customer information in each review
        // This ensures it's visible in search results regardless of auth status
        customer_phone: review.customer_phone,
        customer_address: review.customer_address,
        customer_city: review.customer_city,
        customer_zipcode: review.customer_zipcode,
        customer_nickname: review.customer_nickname,
        customer_business_name: review.customer_business_name,
        associates: review.associates,
        // CRITICAL: Include associate match metadata in each review
        isAssociateMatch: review.isAssociateMatch,
        associateData: review.associateData,
        original_customer_name: review.original_customer_name,
        original_customer_phone: review.original_customer_phone,
        original_customer_address: review.original_customer_address,
        original_customer_city: review.original_customer_city,
        original_customer_zipcode: review.original_customer_zipcode,
        customerName: `${finalFirstName} ${finalLastName}`.trim()
      }))
    };

    hookLogger.debug("🔍 CUSTOMER PROCESSOR - Final customer with reviews:", {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      reviewCount: customer.reviews.length,
      firstReviewData: customer.reviews[0] ? {
        associates: customer.reviews[0].associates,
        customer_business_name: customer.reviews[0].customer_business_name,
        customer_nickname: customer.reviews[0].customer_nickname
      } : null
    });

    customers.push(customer);
  });
  
  hookLogger.debug("Processed review customers:", customers.length);
  return customers;
};
