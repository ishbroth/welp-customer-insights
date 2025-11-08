
import { supabase } from "@/integrations/supabase/client";
import { SearchParams } from "./types";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { scoreReview } from "./reviewScoring";
import { filterAndSortReviews, logSearchResults } from "./reviewFiltering";
import { formatReviewData } from "./reviewDataFormatter";
import { initializeGeocodingForSearch, cleanupAfterSearch } from "@/utils/cityProximity";
import { normalizeState } from "@/utils/stateNormalization";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('reviewSearch');

// Search for associates within reviews and return transformed results
// This function finds reviews where the CUSTOMER name matches the search,
// then extracts associates from those reviews to create associate match results
const searchAssociatesInReviews = async (searchParams: SearchParams, mainSearchReviews: any[]) => {
  const { firstName, lastName } = searchParams;

  hookLogger.debug("=== ASSOCIATE SEARCH START ===");
  hookLogger.debug("Searching for associates in reviews about:", { firstName, lastName });

  // If no name provided, skip associate search
  if (!firstName && !lastName) {
    hookLogger.debug("No name provided for associate search");
    return [];
  }

  const searchFullName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();
  hookLogger.debug("Full name being searched:", searchFullName);

  try {
    // Find reviews where the CUSTOMER matches the search criteria
    // These are the main search results - we'll extract associates from them
    hookLogger.debug(`Checking ${mainSearchReviews.length} main search result reviews for associates...`);

    // Step 1: Collect all unique associates from the filtered reviews
    const uniqueAssociates = new Map<string, { associate: any, originalCustomerName: string }>();

    for (const review of mainSearchReviews) {
      if (!review.associates || !Array.isArray(review.associates) || review.associates.length === 0) {
        continue;
      }

      const customerName = review.customer_name || '';
      hookLogger.debug(`Review ${review.id} about customer "${customerName}" has ${review.associates.length} associate(s)`);

      for (const associate of review.associates) {
        if (!associate || typeof associate !== 'object') continue;

        const associateName = `${associate.firstName || ''} ${associate.lastName || ''}`.trim();
        const associateNameLower = associateName.toLowerCase();

        // Skip if the associate's name matches the search criteria
        const firstNameMatch = firstName && associateNameLower.includes(firstName.toLowerCase());
        const lastNameMatch = lastName && associateNameLower.includes(lastName.toLowerCase());
        if ((firstName && lastName && firstNameMatch && lastNameMatch) ||
            associateNameLower === searchFullName) {
          hookLogger.debug(`Skipping associate ${associateName} - matches search criteria for ${searchFullName}`);
          continue;
        }

        // Add to unique associates (using lowercase name as key to deduplicate)
        if (!uniqueAssociates.has(associateNameLower)) {
          uniqueAssociates.set(associateNameLower, {
            associate,
            originalCustomerName: customerName
          });
          hookLogger.debug(`Found unique associate: ${associateName} (associate of ${customerName})`);
        }
      }
    }

    hookLogger.debug(`Found ${uniqueAssociates.size} unique associate(s)`);

    // Step 2: For each unique associate, find actual reviews where THEY are the customer
    const associateReviews = [];

    for (const [associateNameLower, { associate, originalCustomerName }] of uniqueAssociates.entries()) {
      const associateName = `${associate.firstName || ''} ${associate.lastName || ''}`.trim();

      hookLogger.debug(`Looking up reviews where ${associateName} is the customer...`);

      try {
        // Query for reviews where this associate is the main customer
        const { data: reviewsAboutAssociate, error: lookupError } = await supabase
          .from('reviews')
          .select(`
            id,
            customer_name,
            customer_nickname,
            customer_business_name,
            customer_address,
            customer_city,
            customer_zipcode,
            customer_phone,
            rating,
            content,
            created_at,
            business_id,
            associates,
            is_anonymous
          `)
          .ilike('customer_name', `%${associateName}%`)
          .limit(10);

        if (lookupError) {
          hookLogger.error(`Error looking up reviews for associate ${associateName}:`, lookupError);
        } else if (reviewsAboutAssociate && reviewsAboutAssociate.length > 0) {
          hookLogger.debug(`Found ${reviewsAboutAssociate.length} review(s) about ${associateName}`);

          // Mark each review as an associate match
          for (const associateReview of reviewsAboutAssociate) {
            associateReviews.push({
              ...associateReview,
              isAssociateMatch: true,
              associateData: {
                firstName: firstName || '',
                lastName: lastName || ''
              },
              original_customer_name: originalCustomerName, // The person who was searched for
            });
          }
        } else {
          hookLogger.debug(`No reviews found where ${associateName} is the customer`);
        }
      } catch (error) {
        hookLogger.error(`Exception looking up reviews for associate ${associateName}:`, error);
      }
    }

    hookLogger.debug(`=== ASSOCIATE SEARCH COMPLETE: ${associateReviews.length} associate reviews found ===`);
    return associateReviews;

  } catch (error) {
    hookLogger.error("Error in associate search:", error);
    return [];
  }
};

export const searchReviews = async (
  searchParams: SearchParams,
  unlockedReviews?: string[],
  claimedReviewIds?: string[]
) => {
  const { firstName, lastName, businessName, phone, address, city, state, zipCode } = searchParams;

  hookLogger.debug("=== REVIEW SEARCH START ===");
  hookLogger.debug("Search parameters:", searchParams);
  hookLogger.debug("Claimed review IDs to always include:", claimedReviewIds?.length || 0);

  // Initialize geocoding for the search
  initializeGeocodingForSearch();

  // COMBINED OR FILTERING STRATEGY
  // Build a single query using ALL provided fields with OR logic
  // This casts a wide net, then client-side fuzzy matching validates precisely
  // All provided fields are included to maximize chances of finding relevant records

  const baseSelect = `
    id,
    customer_name,
    customer_nickname,
    customer_business_name,
    customer_address,
    customer_city,
    customer_zipcode,
    customer_phone,
    rating,
    content,
    created_at,
    business_id,
    associates,
    is_anonymous
  `;

  // Build array of OR conditions based on provided fields
  const orConditions: string[] = [];
  const appliedFilters: string[] = [];

  // Add phone condition if provided
  if (phone && phone.trim() !== '') {
    const cleanPhone = phone.replace(/\D/g, '');
    orConditions.push(`customer_phone.ilike.%${cleanPhone}%`);
    appliedFilters.push(`phone: ${cleanPhone}`);
  }

  // Add address condition if provided
  if (address && address.trim() !== '') {
    orConditions.push(`customer_address.ilike.%${address}%`);
    appliedFilters.push(`address: ${address}`);
  }

  // Add name conditions if provided
  if (firstName && firstName.trim() !== '') {
    orConditions.push(`customer_name.ilike.%${firstName}%`);
    appliedFilters.push(`firstName: ${firstName}`);
  }
  if (lastName && lastName.trim() !== '') {
    orConditions.push(`customer_name.ilike.%${lastName}%`);
    appliedFilters.push(`lastName: ${lastName}`);
  }

  // Add city condition if provided
  if (city && city.trim() !== '') {
    orConditions.push(`customer_city.ilike.%${city}%`);
    appliedFilters.push(`city: ${city}`);
  }

  // Add zipcode condition if provided
  if (zipCode && zipCode.trim() !== '') {
    const cleanZip = zipCode.replace(/\D/g, '');
    orConditions.push(`customer_zipcode.ilike.%${cleanZip}%`);
    appliedFilters.push(`zipcode: ${cleanZip}`);
  }

  let allReviews: any[] = [];
  let error = null;

  // Execute query with OR conditions
  if (orConditions.length > 0) {
    hookLogger.debug(`🔍 Building combined OR query with ${orConditions.length} conditions: ${appliedFilters.join(', ')}`);

    const { data, error: queryError } = await supabase
      .from('reviews')
      .select(baseSelect)
      .or(orConditions.join(','))
      .limit(REVIEW_SEARCH_CONFIG.INITIAL_LIMIT);

    if (queryError) {
      error = queryError;
      hookLogger.error('Query error:', queryError);
    } else {
      allReviews = data || [];
      hookLogger.debug(`✅ Combined OR query returned ${allReviews.length} results`);
    }
  } else {
    // No search criteria provided - fetch first 500 records
    hookLogger.debug(`🔍 No search criteria provided, fetching first 500 records`);

    const { data, error: fallbackError } = await supabase
      .from('reviews')
      .select(baseSelect)
      .limit(REVIEW_SEARCH_CONFIG.INITIAL_LIMIT);

    if (fallbackError) {
      error = fallbackError;
    } else {
      allReviews = data || [];
      hookLogger.debug(`📊 Fallback fetch: ${allReviews.length} records`);
    }
  }

  // Note: State filter is applied during scoring phase since reviews don't have customer_state
  if (state && state.trim() !== '') {
    hookLogger.debug(`📝 State filter (${state}) will be validated during client-side scoring`);
  }

  if (error) {
    hookLogger.error("Review search error:", error);
    throw error;
  }

  if (!allReviews || allReviews.length === 0) {
    hookLogger.debug("No reviews found in database");
    return [];
  }

  hookLogger.debug(`Found ${allReviews.length} total reviews in database`);
  hookLogger.debug("🔍 REVIEW SEARCH - Sample review data from DB:", allReviews[0] ? {
    id: allReviews[0].id,
    customer_name: allReviews[0].customer_name,
    customer_business_name: allReviews[0].customer_business_name,
    customer_nickname: allReviews[0].customer_nickname,
    associates: allReviews[0].associates
  } : "No reviews found");

  hookLogger.debug("🔍 REVIEW SEARCH - Looking for Salvatore Sardina review:");
  const salvatoreReview = allReviews.find(r => r.customer_name?.toLowerCase().includes('salvatore'));
  if (salvatoreReview) {
    hookLogger.debug("🔍 FOUND SALVATORE REVIEW:", {
      id: salvatoreReview.id,
      customer_name: salvatoreReview.customer_name,
      customer_nickname: salvatoreReview.customer_nickname,
      customer_city: salvatoreReview.customer_city,
      customer_zipcode: salvatoreReview.customer_zipcode,
      customer_address: salvatoreReview.customer_address
    });
  } else {
    hookLogger.debug("🔍 SALVATORE REVIEW NOT FOUND in fetched reviews");
  }
  
  // Debug: Will check CA reviews after business profile enrichment since state comes from business profile

  // Get business profiles and verification status
  const businessIds = [...new Set(allReviews.map(review => review.business_id).filter(Boolean))];
  hookLogger.debug("Fetching business data for IDs:", businessIds);
  
  let businessProfilesMap = new Map();
  let businessVerificationMap = new Map();
  
  if (businessIds.length > 0) {
    // Fetch business profiles
    const { data: businessProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, avatar, type, state, city')
      .in('id', businessIds)
      .eq('type', 'business');

    if (profileError) {
      hookLogger.error("Error fetching business profiles:", profileError);
    } else {
      hookLogger.debug("✅ Business profiles successfully fetched:", businessProfiles?.length || 0);
      businessProfiles?.forEach(profile => {
        businessProfilesMap.set(profile.id, profile);
        hookLogger.debug(`✅ Profile mapped: ${profile.id} -> ${profile.name}`);
      });
    }

    // Fetch business verification status and state information
    const { data: businessInfos, error: businessError } = await supabase
      .from('business_info')
      .select('id, verified, business_name, license_state')
      .in('id', businessIds);

    if (businessError) {
      hookLogger.error("Error fetching business verification status:", businessError);
    } else {
      hookLogger.debug("✅ Business info successfully fetched:", businessInfos?.length || 0);
      businessInfos?.forEach(business => {
        const isVerified = Boolean(business.verified);
        businessVerificationMap.set(business.id, isVerified);
        hookLogger.debug(`✅ VERIFICATION MAPPED: Business ID ${business.id} -> verified: ${isVerified}`);
        
        // Enhance existing profile with verification status, state, and city
        if (businessProfilesMap.has(business.id)) {
          const existingProfile = businessProfilesMap.get(business.id);
          existingProfile.verified = isVerified;
          existingProfile.business_name = business.business_name;

          // City comes from profiles table (already in existingProfile.city)

          // Prioritize profile.state over license_state, normalize both
          const profileState = existingProfile.state ? normalizeState(existingProfile.state) : null;
          const licenseState = business.license_state ? normalizeState(business.license_state) : null;
          existingProfile.business_state = profileState || licenseState;

          hookLogger.debug(`[STATE_MAPPING] Business ${business.id}: profile.state="${existingProfile.state}" -> normalized: "${profileState}", license_state="${business.license_state}" -> normalized: "${licenseState}", final: "${existingProfile.business_state}", city: "${existingProfile.city}"`);

          businessProfilesMap.set(business.id, existingProfile);
        }
      });
    }
  }

  // Check if this is a single field search
  const searchFields = [firstName, lastName, phone, address, city, state, zipCode].filter(Boolean);
  const isSingleFieldSearch = searchFields.length === 1;

  hookLogger.debug(`Processing ${allReviews.length} reviews for search matching...`);
  hookLogger.debug("Is single field search:", isSingleFieldSearch);

  // Score each review based on how well it matches the search criteria (async)
  const scoringPromises = allReviews.map(async review => {
    // Add the business profile data to the review
    const businessProfile = businessProfilesMap.get(review.business_id);
    
    hookLogger.debug(`🔍 Processing review ${review.id} - Business ID: ${review.business_id}`);
    hookLogger.debug(`🔍 Business Profile found:`, {
      hasProfile: !!businessProfile,
      name: businessProfile?.name || businessProfile?.business_name,
      verified: businessProfile?.verified,
      city: businessProfile?.city,
      state: businessProfile?.state,
      business_state: businessProfile?.business_state
    });

    // DEBUG: Log city/state specifically
    console.log(`🏙️ REVIEW SEARCH - Business profile city/state for ${businessProfile?.name}:`, {
      businessId: review.business_id,
      city: businessProfile?.city,
      state: businessProfile?.state,
      business_state: businessProfile?.business_state,
      hasCity: !!businessProfile?.city,
      hasState: !!(businessProfile?.state || businessProfile?.business_state)
    });

    const reviewWithProfile = {
      ...review,
      profiles: businessProfile || null
    };
    
    const formattedReview = formatReviewData(reviewWithProfile);

    // DEBUG: Log formatted review city/state
    console.log(`🏙️ FORMATTED REVIEW - After formatting for ${formattedReview.reviewerName}:`, {
      reviewId: formattedReview.id,
      reviewerCity: formattedReview.reviewerCity,
      reviewerState: formattedReview.reviewerState,
      hasReviewerCity: !!formattedReview.reviewerCity,
      hasReviewerState: !!formattedReview.reviewerState
    });

    // Set verification status properly
    const verificationStatus = businessProfile?.verified || businessVerificationMap.get(review.business_id) || false;
    hookLogger.debug(`✅ VERIFICATION FINAL: Business ID ${review.business_id}, verified: ${verificationStatus}`);
    
    formattedReview.reviewerVerified = verificationStatus;
    
    // Use business_name from business_info if available, otherwise use profile name
    if (businessProfile?.business_name) {
      formattedReview.reviewerName = businessProfile.business_name;
    } else if (businessProfile?.name) {
      formattedReview.reviewerName = businessProfile.name;
    }
    
    // Set the avatar from the profile
    if (businessProfile?.avatar) {
      formattedReview.reviewerAvatar = businessProfile.avatar;
    }
    
    hookLogger.debug(`✅ FINAL REVIEW DATA: Business ID ${review.business_id}:`, {
      reviewerName: formattedReview.reviewerName,
      reviewerVerified: formattedReview.reviewerVerified,
      reviewerAvatar: formattedReview.reviewerAvatar ? 'Present' : 'Missing'
    });
    
    const scoredReview = await scoreReview(formattedReview, {
      firstName,
      lastName,
      businessName,
      phone,
      address,
      city,
      state,
      zipCode
    }, businessProfile?.business_state || businessProfile?.state || null);
    
    hookLogger.debug(`Review ${review.id}: Score: ${scoredReview.searchScore}, Business: ${formattedReview.reviewerName}, Verified: ${formattedReview.reviewerVerified}`);
    
    return scoredReview;
  });

  // Wait for all scoring to complete
  const scoredReviews = await Promise.all(scoringPromises);

  // IMPORTANT: Filter the direct match reviews FIRST before extracting associates
  // We only want to show associates from reviews that actually matched the search
  const searchContext = {
    hasName: Boolean(firstName || lastName),
    hasLocation: Boolean(address || city || zipCode),
    hasPhone: Boolean(phone),
    hasAddress: Boolean(address),
    isNameFocused: Boolean(firstName || lastName) && Boolean(address || city || zipCode || phone),
    isLocationOnly: !Boolean(firstName || lastName) && !Boolean(phone) && Boolean(address || city || zipCode),
    isPhoneOnly: !Boolean(firstName || lastName) && Boolean(phone) && !Boolean(address || city || zipCode),
    isPhoneWithLocation: !Boolean(firstName || lastName) && Boolean(phone) && Boolean(address || city || zipCode),
    isAddressWithState: !Boolean(firstName || lastName) && !Boolean(phone) && Boolean(address) && Boolean(state)
  };

  const filteredDirectMatches = isSingleFieldSearch
    ? scoredReviews.filter(review => review.searchScore > 0 || review.matchCount > 0)
    : filterAndSortReviews(scoredReviews, isSingleFieldSearch, searchContext, unlockedReviews, {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode
      });

  hookLogger.debug(`🔍 Filtered ${scoredReviews.length} reviews down to ${filteredDirectMatches.length} that match search criteria`);

  // Search for associate matches if name provided
  // ONLY extract associates from reviews that passed filtering (actual search results)
  let associateMatches = [];
  if (firstName || lastName) {
    hookLogger.debug("🔍 Starting associate search for:", { firstName, lastName });
    const rawAssociateMatches = await searchAssociatesInReviews(searchParams, filteredDirectMatches);
    hookLogger.debug("🔍 Raw associate matches found:", rawAssociateMatches.length);

    // Process associate matches through the same business profile enrichment and scoring
    const associateScoringPromises = rawAssociateMatches.map(async review => {
      // Add the business profile data to the associate match review
      const businessProfile = businessProfilesMap.get(review.business_id);

      hookLogger.debug(`🔍 Processing associate match ${review.id} - Business ID: ${review.business_id}`);

      const reviewWithProfile = {
        ...review,
        profiles: businessProfile || null
      };

      const formattedReview = formatReviewData(reviewWithProfile);

      // Set verification status properly
      const verificationStatus = businessProfile?.verified || businessVerificationMap.get(review.business_id) || false;
      formattedReview.reviewerVerified = verificationStatus;

      // Use business_name from business_info if available, otherwise use profile name
      if (businessProfile?.business_name) {
        formattedReview.reviewerName = businessProfile.business_name;
      } else if (businessProfile?.name) {
        formattedReview.reviewerName = businessProfile.name;
      }

      // Set the avatar from the profile
      if (businessProfile?.avatar) {
        formattedReview.reviewerAvatar = businessProfile.avatar;
      }

      // Preserve associate match metadata (now handled in formatReviewData)
      formattedReview.isAssociateMatch = review.isAssociateMatch;
      formattedReview.associateData = review.associateData;
      formattedReview.original_customer_name = review.original_customer_name;

      hookLogger.debug(`✅ ASSOCIATE MATCH: Business ID ${review.business_id}:`, {
        reviewerName: formattedReview.reviewerName,
        reviewerVerified: formattedReview.reviewerVerified,
        associateName: formattedReview.customer_name,
        originalCustomer: formattedReview.original_customer_name
      });

      const scoredReview = await scoreReview(formattedReview, {
        firstName,
        lastName,
        businessName,
        phone,
        address,
        city,
        state,
        zipCode
      }, businessProfile?.business_state || businessProfile?.state || null);

      hookLogger.debug(`Associate match ${review.id}: Score: ${scoredReview.searchScore}, Associate: ${formattedReview.customer_name}, Business: ${formattedReview.reviewerName}`);

      return scoredReview;
    });

    // Wait for all associate scoring to complete
    associateMatches = await Promise.all(associateScoringPromises);
    hookLogger.debug(`🔍 Processed ${associateMatches.length} associate matches`);
  }

  // Deduplicate: Remove reviews from direct matches that also appear in associate matches
  // This prevents the same review from appearing twice when clicking through associates
  const associateReviewIds = new Set(associateMatches.map(r => r.id));
  const deduplicatedDirectMatches = filteredDirectMatches.filter(r => !associateReviewIds.has(r.id));

  hookLogger.debug(`🔍 DEDUPLICATION: Removed ${filteredDirectMatches.length - deduplicatedDirectMatches.length} duplicate reviews from direct matches`);

  // Combine deduplicated direct matches with associate matches
  // Direct matches are already filtered, associate matches bypass filtering
  let filteredReviews = [...deduplicatedDirectMatches, ...associateMatches];

  hookLogger.debug(`🔍 SEARCH DEBUG: Combined final results`);
  hookLogger.debug(`🔍 Deduplicated direct matches (${deduplicatedDirectMatches.length}):`, deduplicatedDirectMatches.map(r => ({
    id: r.id,
    name: r.customer_name,
    score: r.searchScore,
    isAssociate: r.isAssociateMatch
  })));
  hookLogger.debug(`🔍 Associate matches (${associateMatches.length}):`, associateMatches.map(r => ({
    id: r.id,
    name: r.customer_name,
    score: r.searchScore,
    isAssociate: r.isAssociateMatch
  })));
  hookLogger.debug(`🔍 Total combined: ${filteredReviews.length}`);

  // ALWAYS include reviews claimed by the current user, even if they didn't match the search criteria
  // This ensures that once a customer claims a review, it's always visible in their searches
  if (claimedReviewIds && claimedReviewIds.length > 0) {
    const claimedReviewsNotInResults = scoredReviews.filter(
      review =>
        claimedReviewIds.includes(review.id) &&
        !filteredReviews.some(filtered => filtered.id === review.id)
    );

    if (claimedReviewsNotInResults.length > 0) {
      hookLogger.debug(`📌 Adding ${claimedReviewsNotInResults.length} claimed reviews that didn't match search criteria`);
      // Add claimed reviews to the beginning of the results
      filteredReviews = [...claimedReviewsNotInResults, ...filteredReviews];
    }
  }

  logSearchResults(filteredReviews);
  
  // Cleanup geocoding cache after search
  cleanupAfterSearch();
  
  hookLogger.debug("=== REVIEW SEARCH COMPLETE ===");
  return filteredReviews;
};
