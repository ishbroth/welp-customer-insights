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
    // Fetch business profiles with the new RLS permissions
    console.log("Attempting to fetch business profiles with updated RLS...");
    const { data: businessProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, avatar, type, state, verified')
      .in('id', businessIds)
      .eq('type', 'business'); // Explicitly filter for business profiles

    if (profileError) {
      console.error("Error fetching business profiles:", profileError);
    } else {
      console.log("✅ Business profiles successfully fetched:", businessProfiles?.length || 0);
      console.log("Business profiles data:", businessProfiles);
      businessProfiles?.forEach(profile => {
        businessProfilesMap.set(profile.id, profile);
        console.log(`✅ Profile mapped: ${profile.id} -> ${profile.name} (Avatar: ${profile.avatar ? 'Yes' : 'No'})`);
      });
    }

    // Fetch from business_info table with the new RLS permissions
    console.log("Attempting to fetch business_info with updated RLS...");
    const { data: businessInfos, error: businessError } = await supabase
      .from('business_info')
      .select('id, verified, business_name')
      .in('id', businessIds);

    if (businessError) {
      console.error("Error fetching business verification status:", businessError);
    } else {
      console.log("✅ Business info successfully fetched:", businessInfos?.length || 0);
      console.log("Business info data:", businessInfos);
      businessInfos?.forEach(business => {
        const isVerified = Boolean(business.verified);
        businessVerificationMap.set(business.id, isVerified);
        console.log(`✅ VERIFICATION MAPPED: Business ID ${business.id} -> verified: ${isVerified} (business_name: ${business.business_name})`);
        
        // Enhance existing profile with business_info data
        if (businessProfilesMap.has(business.id)) {
          const existingProfile = businessProfilesMap.get(business.id);
          existingProfile.business_name = business.business_name;
          existingProfile.verified = isVerified;
          businessProfilesMap.set(business.id, existingProfile);
          console.log(`✅ Enhanced profile: ${business.id} -> ${business.business_name}, verified: ${isVerified}`);
        } else if (business.business_name) {
          // Create profile entry from business_info if no profile exists
          businessProfilesMap.set(business.id, {
            id: business.id,
            name: business.business_name,
            business_name: business.business_name,
            avatar: null,
            type: 'business',
            state: null,
            verified: isVerified
          });
          console.log(`✅ Created profile from business_info: ${business.id} -> ${business.business_name}, verified: ${isVerified}`);
        }
      });
    }

    // Final check - log what we have for each business ID
    businessIds.forEach(businessId => {
      const profile = businessProfilesMap.get(businessId);
      const verified = businessVerificationMap.get(businessId);
      console.log(`✅ FINAL BUSINESS DATA CHECK: ID ${businessId}:`, {
        hasProfile: !!profile,
        profileName: profile?.name || profile?.business_name,
        hasAvatar: !!profile?.avatar,
        verified: verified || profile?.verified || false
      });
      
      if (!businessProfilesMap.has(businessId)) {
        console.log(`⚠️ Creating fallback profile for business ID: ${businessId}`);
        businessProfilesMap.set(businessId, {
          id: businessId,
          name: "Business",
          avatar: null,
          type: 'business',
          state: null,
          verified: false
        });
        businessVerificationMap.set(businessId, false);
      }
    });
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
    
    console.log(`🔍 Processing review ${review.id} - Business ID: ${review.business_id}`);
    console.log(`🔍 Business Profile found:`, {
      hasProfile: !!businessProfile,
      name: businessProfile?.name || businessProfile?.business_name,
      avatar: businessProfile?.avatar,
      verified: businessProfile?.verified
    });
    
    const reviewWithProfile = {
      ...review,
      profiles: businessProfile || null,
      customer_profile: customerProfile || null
    };
    
    const formattedReview = formatReviewData(reviewWithProfile);
    
    // Set verification status properly - use the enhanced profile data
    const verificationStatus = businessProfile?.verified || businessVerificationMap.get(review.business_id) || false;
    console.log(`✅ VERIFICATION FINAL: Business ID ${review.business_id}, Final verified status: ${verificationStatus}`);
    
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
    
    console.log(`Review ${review.id}: Customer "${review.customer_name}", Score: ${scoredReview.searchScore}, Matches: ${scoredReview.matchCount}, Business: ${formattedReview.reviewerName}, Verified: ${scoredReview.reviewerVerified}, Business State: ${businessProfile?.state}`);
    
    return scoredReview;
  });

  // Filter and sort the results - for single field searches, be more lenient
  const filteredReviews = isSingleFieldSearch 
    ? scoredReviews.filter(review => review.searchScore > 0 || review.matchCount > 0)
    : filterAndSortReviews(scoredReviews, isSingleFieldSearch);

  // Log results for debugging
  logSearchResults(filteredReviews);
  
  console.log("=== REVIEW SEARCH COMPLETE ===");
  console.log("Final filtered reviews with complete business data:");
  filteredReviews.forEach(review => {
    console.log(`✅ Review ID: ${review.id}:`, {
      business: review.reviewerName,
      verified: review.reviewerVerified,
      avatar: review.reviewerAvatar ? 'Present' : 'Missing'
    });
  });
  
  return filteredReviews;
};
