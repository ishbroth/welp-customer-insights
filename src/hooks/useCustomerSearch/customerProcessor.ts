
import { Customer } from "@/types/search";
import { ReviewData } from "./types";
import { logger } from '@/utils/logger';
import { calculateNameSimilarity } from '@/utils/stringSimilarity';
import { compareAddresses } from '@/utils/addressNormalization';
import { arePhonesEquivalent } from '@/utils/phoneUtils';

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

    hookLogger.debug(`Processing review ${review.id}: name="${name}", isAssociateMatch=${review.isAssociateMatch}, phone="${phone}", address="${address}"`);

    // IMPORTANT: Associate matches should NEVER be grouped with non-associate reviews
    // BUT associate match reviews about the same person should be grouped together
    if (review.isAssociateMatch) {
      // Check if we already have an associate match group for this person
      let foundExistingAssociateGroup = false;
      for (const [existingKey, existingReviews] of customerGroups.entries()) {
        // Only check other associate match groups
        if (!existingKey.startsWith('associate-')) continue;

        const existingReview = existingReviews[0];
        const existingName = existingReview.customer_name?.toLowerCase().trim();
        const existingNickname = existingReview.customer_nickname?.toLowerCase().trim() || '';
        const nickname = review.customer_nickname?.toLowerCase().trim() || '';

        // Use fuzzy name matching for associate reviews too
        const nameSimilarity = calculateNameSimilarity(name, existingName);
        const nameMatchesNickname = nickname && calculateNameSimilarity(nickname, existingName) >= 0.87;
        const existingNameMatchesNickname = existingNickname && calculateNameSimilarity(name, existingNickname) >= 0.87;
        const nicknameBothMatch = nickname && existingNickname && calculateNameSimilarity(nickname, existingNickname) >= 0.87;
        const namesAreSimilar = nameSimilarity >= 0.87 || nameMatchesNickname || existingNameMatchesNickname || nicknameBothMatch;

        // Group associate matches using fuzzy logic
        const phoneMatch = arePhonesEquivalent(review.customer_phone, existingReview.customer_phone);
        const addressMatch = address && existingReview.customer_address &&
                            compareAddresses(address, existingReview.customer_address, 0.87);
        const bothMissingInfo = !phone && !existingReview.customer_phone && !address && !existingReview.customer_address;

        if (namesAreSimilar && (phoneMatch || addressMatch || bothMissingInfo)) {
          customerGroups.get(existingKey)!.push(review);
          foundExistingAssociateGroup = true;
          hookLogger.debug(`Adding associate match ${name} to existing group (name sim: ${nameSimilarity.toFixed(2)})`);
          break;
        }
      }

      if (!foundExistingAssociateGroup) {
        hookLogger.debug(`Creating new group for associate match: ${name}`);
        const groupKey = `associate-${name}-${phone || address || Math.random()}`;
        customerGroups.set(groupKey, [review]);
      }
      return; // Skip the normal grouping logic for associate matches
    }

    // Check if we already have a group with a similar name (fuzzy matching)
    let foundExistingGroup = false;
    for (const [existingKey, existingReviews] of customerGroups.entries()) {
      // Skip associate match groups when looking for existing groups
      if (existingKey.startsWith('associate-')) continue;

      const existingReview = existingReviews[0];
      const existingName = existingReview.customer_name.toLowerCase().trim();
      const existingNickname = existingReview.customer_nickname?.toLowerCase().trim() || '';
      const nickname = review.customer_nickname?.toLowerCase().trim() || '';

      // Check if names are similar using fuzzy matching (threshold 0.87)
      // Also check nicknames if available
      const nameSimilarity = calculateNameSimilarity(name, existingName);
      const nameMatchesNickname = nickname && calculateNameSimilarity(nickname, existingName) >= 0.87;
      const existingNameMatchesNickname = existingNickname && calculateNameSimilarity(name, existingNickname) >= 0.87;
      const nicknameBothMatch = nickname && existingNickname && calculateNameSimilarity(nickname, existingNickname) >= 0.87;

      const namesAreSimilar = nameSimilarity >= 0.87 || nameMatchesNickname || existingNameMatchesNickname || nicknameBothMatch;

      // If names are similar, check if we should group them together
      if (namesAreSimilar) {
        // Phone equivalence check (exact match or last 7 digits)
        const phoneMatch = arePhonesEquivalent(review.customer_phone, existingReview.customer_phone);

        // Address fuzzy matching (threshold 0.87)
        const addressMatch = address && existingReview.customer_address &&
                            compareAddresses(address, existingReview.customer_address, 0.87);

        // City similarity
        const existingCity = existingReview.customer_city?.toLowerCase().trim() || '';
        const citySimilarity = city && existingCity ? calculateNameSimilarity(city, existingCity) : 0;
        const cityMatch = citySimilarity >= 0.87;

        // Zipcode match
        const existingZip = existingReview.customer_zipcode?.replace(/\D/g, '') || '';
        const zip = review.customer_zipcode?.replace(/\D/g, '') || '';
        const zipMatch = zip && existingZip && zip === existingZip;

        // Both missing contact info (fallback)
        const bothMissingInfo = !phone && !existingReview.customer_phone && !address && !existingReview.customer_address;

        // Group together if:
        // - Phone matches (strongest signal), OR
        // - Address matches (strong signal), OR
        // - City + Zip both match (medium signal), OR
        // - Both have no contact info (weak fallback)
        if (phoneMatch || addressMatch || (cityMatch && zipMatch) || bothMissingInfo) {
          customerGroups.get(existingKey)!.push(review);
          foundExistingGroup = true;
          hookLogger.debug(`Grouped review ${review.id} with existing group ${existingKey} (name sim: ${nameSimilarity.toFixed(2)}, phone: ${phoneMatch}, address: ${addressMatch}, city+zip: ${cityMatch && zipMatch})`);
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
      // For associate matches, we already have the actual reviews about the associate
      // So firstName/lastName are already correct from the review's customer_name
      // We just need to preserve the originalCustomerInfo for the "Associate of:" display
      hookLogger.debug(`Associate match: ${finalFirstName} ${finalLastName} (associate of ${mostCompleteReview.original_customer_name})`);
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
