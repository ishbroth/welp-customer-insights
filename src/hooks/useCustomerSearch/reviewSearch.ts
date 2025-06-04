
import { supabase } from "@/integrations/supabase/client";
import { SearchParams } from "./types";
import { REVIEW_SEARCH_CONFIG } from "./reviewSearchConfig";
import { scoreReview } from "./reviewScoring";
import { filterAndSortReviews, logSearchResults } from "./reviewFiltering";
import { formatReviewData } from "./reviewDataFormatter";

export const searchReviews = async (searchParams: SearchParams) => {
  const { firstName, lastName, phone, address, city, state, zipCode } = searchParams;

  console.log("=== REVIEW SEARCH START ===");
  console.log("Search parameters:", searchParams);
  
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
      business_id,
      customer_id
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
  
  // Get customer profiles for avatar display
  const customerIds = [...new Set(allReviews.map(review => review.customer_id).filter(Boolean))];
  console.log("Fetching customer data for IDs:", customerIds);
  
  let businessProfilesMap = new Map();
  let businessVerificationMap = new Map();
  let customerProfilesMap = new Map();
  
  if (businessIds.length > 0) {
    // Fetch business profiles - remove any filters to get all profiles
    const { data: businessProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, avatar, type, state')
      .in('id', businessIds);

    if (profileError) {
      console.error("Error fetching business profiles:", profileError);
    } else {
      console.log("Business profiles found:", businessProfiles?.length || 0);
      console.log("Raw business profiles data:", businessProfiles);
      businessProfiles?.forEach(profile => {
        businessProfilesMap.set(profile.id, profile);
        console.log(`Profile mapping: ${profile.id} -> ${profile.name} (State: ${profile.state}, Type: ${profile.type})`);
      });
    }

    // Fetch business verification statuses only (state column doesn't exist in business_info)
    const { data: businessInfos, error: businessError } = await supabase
      .from('business_info')
      .select('id, verified, business_name')
      .in('id', businessIds);

    if (businessError) {
      console.error("Error fetching business verification status:", businessError);
    } else {
      console.log("Business verification data found:", businessInfos?.length || 0);
      console.log("Raw business info data:", businessInfos);
      businessInfos?.forEach(business => {
        const isVerified = Boolean(business.verified);
        businessVerificationMap.set(business.id, isVerified);
        console.log(`VERIFICATION MAPPING: Business ID ${business.id} -> verified: ${isVerified} (raw value: ${business.verified})`);
        
        // If no profile found, create one from business_info
        if (!businessProfilesMap.has(business.id)) {
          businessProfilesMap.set(business.id, {
            id: business.id,
            name: business.business_name || 'Unknown Business',
            avatar: null,
            type: 'business',
            state: null // State info must come from profiles table
          });
          console.log(`Created profile from business_info: ${business.id} -> ${business.business_name}`);
        }
      });
    }
  }

  // Fetch customer profiles for avatars
  if (customerIds.length > 0) {
    const { data: customerProfiles, error: customerError } = await supabase
      .from('profiles')
      .select('id, avatar, first_name, last_name')
      .in('id', customerIds);

    if (customerError) {
      console.error("Error fetching customer profiles:", customerError);
    } else {
      console.log("Customer profiles found:", customerProfiles?.length || 0);
      customerProfiles?.forEach(profile => {
        customerProfilesMap.set(profile.id, profile);
        console.log(`Customer profile mapping: ${profile.id} -> ${profile.first_name} ${profile.last_name}`);
      });
    }
  }

  // Check if this is a single field search
  const searchFields = [firstName, lastName, phone, address, city, state, zipCode].filter(Boolean);
  const isSingleFieldSearch = searchFields.length === 1;

  console.log(`Processing ${allReviews.length} reviews for search matching...`);
  console.log("Is single field search:", isSingleFieldSearch);

  // Score each review based on how well it matches the search criteria
  const scoredReviews = allReviews.map(review => {
    // Add the business profile data to the review
    const businessProfile = businessProfilesMap.get(review.business_id);
    const customerProfile = customerProfilesMap.get(review.customer_id);
    
    console.log(`Processing review ${review.id} - Business ID: ${review.business_id}, Business Profile State: ${businessProfile?.state}`);
    
    const reviewWithProfile = {
      ...review,
      profiles: businessProfile || null,
      customer_profile: customerProfile || null
    };
    
    const formattedReview = formatReviewData(reviewWithProfile);
    
    // Add verification status - ENSURE THIS IS PROPERLY SET
    const verificationStatus = businessVerificationMap.get(review.business_id) || false;
    formattedReview.reviewerVerified = verificationStatus;
    
    console.log(`FINAL VERIFICATION CHECK: Business ID ${review.business_id}, Verification Status: ${verificationStatus}, Business Name: ${formattedReview.reviewerName}, Raw Map Value: ${businessVerificationMap.get(review.business_id)}`);
    
    // Pass the business profile state directly to scoring for state matching
    const scoredReview = scoreReview(formattedReview, { 
      firstName, 
      lastName, 
      phone, 
      address, 
      city, 
      state, 
      zipCode 
    }, businessProfile?.state || null);
    
    console.log(`Review ${review.id}: Customer "${review.customer_name}", Score: ${scoredReview.searchScore}, Matches: ${scoredReview.matchCount}, Business: ${formattedReview.reviewerName}, Verified: ${verificationStatus}, Business State: ${businessProfile?.state}`);
    
    return scoredReview;
  });

  // Filter and sort the results - for single field searches, be more lenient
  const filteredReviews = isSingleFieldSearch 
    ? scoredReviews.filter(review => review.searchScore > 0 || review.matchCount > 0)
    : filterAndSortReviews(scoredReviews, isSingleFieldSearch);

  // Log results for debugging
  logSearchResults(filteredReviews);
  
  console.log("=== REVIEW SEARCH COMPLETE ===");
  return filteredReviews;
};
