
import { supabase } from "@/integrations/supabase/client";
import { SearchParams } from "./types";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { scoreReview } from "./reviewScoring";
import { filterAndSortReviews, logSearchResults } from "./reviewFiltering";
import { formatReviewData } from "./reviewDataFormatter";
import { initializeGeocodingForSearch, cleanupAfterSearch } from "@/utils/cityProximity";

export const searchReviews = async (searchParams: SearchParams, unlockedReviews?: string[]) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("=== REVIEW SEARCH START ===");
  console.log("Search parameters:", searchParams);
  
  // Initialize geocoding for the search
  initializeGeocodingForSearch();
  
  // Get all reviews with business profile data
  const { data: allReviews, error } = await supabase
    .from('reviews')
    .select(`
      id, 
      customer_name, 
      customer_address, 
      customer_city, 
      customer_zipcode, 
      customer_phone, 
      rating,
      content,
      created_at,
      business_id
    `)
    .limit(REVIEW_SEARCH_CONFIG.INITIAL_LIMIT);

  if (error) {
    console.error("Review search error:", error);
    throw error;
  }

  if (!allReviews || allReviews.length === 0) {
    console.log("No reviews found in database");
    return [];
  }

  console.log(`Found ${allReviews.length} total reviews in database`);

  // Get business profiles and verification status
  const businessIds = [...new Set(allReviews.map(review => review.business_id).filter(Boolean))];
  console.log("Fetching business data for IDs:", businessIds);
  
  let businessProfilesMap = new Map();
  let businessVerificationMap = new Map();
  
  if (businessIds.length > 0) {
    // Fetch business profiles
    const { data: businessProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, avatar, type, state')
      .in('id', businessIds)
      .eq('type', 'business');

    if (profileError) {
      console.error("Error fetching business profiles:", profileError);
    } else {
      console.log("✅ Business profiles successfully fetched:", businessProfiles?.length || 0);
      businessProfiles?.forEach(profile => {
        businessProfilesMap.set(profile.id, profile);
        console.log(`✅ Profile mapped: ${profile.id} -> ${profile.name}`);
      });
    }

    // Fetch business verification status and state information
    const { data: businessInfos, error: businessError } = await supabase
      .from('business_info')
      .select('id, verified, business_name, license_state')
      .in('id', businessIds);

    if (businessError) {
      console.error("Error fetching business verification status:", businessError);
    } else {
      console.log("✅ Business info successfully fetched:", businessInfos?.length || 0);
      businessInfos?.forEach(business => {
        const isVerified = Boolean(business.verified);
        businessVerificationMap.set(business.id, isVerified);
        console.log(`✅ VERIFICATION MAPPED: Business ID ${business.id} -> verified: ${isVerified}`);
        
        // Enhance existing profile with verification status and state
        if (businessProfilesMap.has(business.id)) {
          const existingProfile = businessProfilesMap.get(business.id);
          existingProfile.verified = isVerified;
          existingProfile.business_name = business.business_name;
          existingProfile.business_state = business.license_state; // Use license_state for business state
          businessProfilesMap.set(business.id, existingProfile);
        }
      });
    }
  }

  // Check if this is a single field search
  const searchFields = [firstName, lastName, phone, address, city, state, zipCode].filter(Boolean);
  const isSingleFieldSearch = searchFields.length === 1;

  console.log(`Processing ${allReviews.length} reviews for search matching...`);
  console.log("Is single field search:", isSingleFieldSearch);

  // Score each review based on how well it matches the search criteria (async)
  const scoringPromises = allReviews.map(async review => {
    // Add the business profile data to the review
    const businessProfile = businessProfilesMap.get(review.business_id);
    
    console.log(`🔍 Processing review ${review.id} - Business ID: ${review.business_id}`);
    console.log(`🔍 Business Profile found:`, {
      hasProfile: !!businessProfile,
      name: businessProfile?.name || businessProfile?.business_name,
      verified: businessProfile?.verified
    });
    
    const reviewWithProfile = {
      ...review,
      profiles: businessProfile || null
    };
    
    const formattedReview = formatReviewData(reviewWithProfile);
    
    // Set verification status properly
    const verificationStatus = businessProfile?.verified || businessVerificationMap.get(review.business_id) || false;
    console.log(`✅ VERIFICATION FINAL: Business ID ${review.business_id}, verified: ${verificationStatus}`);
    
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
    
    console.log(`✅ FINAL REVIEW DATA: Business ID ${review.business_id}:`, {
      reviewerName: formattedReview.reviewerName,
      reviewerVerified: formattedReview.reviewerVerified,
      reviewerAvatar: formattedReview.reviewerAvatar ? 'Present' : 'Missing'
    });
    
    const scoredReview = await scoreReview(formattedReview, { 
      firstName, 
      lastName, 
      phone, 
      address, 
      city, 
      state, 
      zipCode 
    }, businessProfile?.business_state || businessProfile?.state || null);
    
    console.log(`Review ${review.id}: Score: ${scoredReview.searchScore}, Business: ${formattedReview.reviewerName}, Verified: ${formattedReview.reviewerVerified}`);
    
    return scoredReview;
  });

  // Wait for all scoring to complete
  const scoredReviews = await Promise.all(scoringPromises);

  // Detect search context for filtering
  const searchContext = {
    hasName: Boolean(firstName || lastName),
    hasLocation: Boolean(address || city || zipCode),
    hasPhone: Boolean(phone),
    isNameFocused: Boolean(firstName || lastName) && Boolean(address || city || zipCode || phone),
    isLocationOnly: !Boolean(firstName || lastName) && !Boolean(phone) && Boolean(address || city || zipCode),
    isPhoneOnly: !Boolean(firstName || lastName) && Boolean(phone) && !Boolean(address || city || zipCode),
    isPhoneWithLocation: !Boolean(firstName || lastName) && Boolean(phone) && Boolean(address || city || zipCode)
  };

  // Filter and sort the results
  const filteredReviews = isSingleFieldSearch 
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

  logSearchResults(filteredReviews);
  
  // Cleanup geocoding cache after search
  cleanupAfterSearch();
  
  console.log("=== REVIEW SEARCH COMPLETE ===");
  return filteredReviews;
};
