import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yftvcixhifvrovwhtgtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHZjaXhoaWZ2cm92d2h0Z3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODY1ODQsImV4cCI6MjA2MTU2MjU4NH0.dk0-iM54olbkNnCEb92-KNsIeDw9u2owEg4B-fh5ggc";

const supabaseSimple = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchCustomerReviewsFromDB = async (currentUser: any) => {
  console.log("=== FETCHING REVIEWS FOR USER ===");
  console.log("User type:", currentUser.type);
  console.log("User ID:", currentUser.id);
  console.log("User name:", currentUser.name);
  
  if (currentUser.type === "customer") {
    console.log("Fetching reviews for customer account...");
    
    let allReviews: any[] = [];

    // Search 1: Reviews claimed by this customer
    const { data: claimedReviews, error: claimedError } = await supabaseSimple
      .from('review_claims')
      .select(`
        reviews (
          id, business_id, rating, content, customer_name, customer_address, 
          customer_city, customer_zipcode, customer_phone, created_at, updated_at
        )
      `)
      .eq('claimed_by', currentUser.id);

    if (claimedError) {
      console.error("Error fetching claimed reviews:", claimedError);
    } else {
      const reviewsFromClaims = claimedReviews?.map((claim: any) => claim.reviews).filter(Boolean) || [];
      console.log("Search 1 (claimed reviews) found", reviewsFromClaims.length, "reviews");
      allReviews = [...allReviews, ...reviewsFromClaims];
    }

    // Search 2: By customer name if we have a name
    if (currentUser?.name) {
      console.log("Searching by customer name:", currentUser.name);
      
      const { data: nameReviews, error: nameError } = await supabaseSimple
        .from('reviews')
        .select('*')
        .ilike('customer_name', `%${currentUser.name}%`)
        .order('created_at', { ascending: false });

      if (nameError) {
        console.error("Error fetching reviews by name:", nameError);
      } else {
        console.log("Search 2 found", nameReviews?.length || 0, "reviews");
        allReviews = [...allReviews, ...(nameReviews || [])];
      }
    }

    // Remove duplicates based on review ID
    const uniqueReviews = allReviews.filter((review: any, index: number, self: any[]) => 
      index === self.findIndex((r: any) => r.id === review.id)
    );

    console.log("Total unique reviews found:", uniqueReviews.length);

    // Now fetch business profile data and verification status for each review
    const businessIds = [...new Set(uniqueReviews.map((r: any) => r.business_id).filter(Boolean))];
    console.log("Fetching business data for IDs:", businessIds);

    let businessProfilesMap = new Map();
    let businessVerificationMap = new Map();

    if (businessIds.length > 0) {
      // Fetch business profiles
      const { data: businessProfiles, error: profileError } = await supabaseSimple
        .from('profiles')
        .select('*')
        .in('id', businessIds)
        .eq('type', 'business');

      if (!profileError && businessProfiles) {
        businessProfiles.forEach((profile: any) => {
          businessProfilesMap.set(profile.id, profile);
        });
      }

      // Fetch business verification statuses
      const { data: businessInfos, error: businessError } = await supabaseSimple
        .from('business_info')
        .select('*')
        .in('id', businessIds);

      if (!businessError && businessInfos) {
        businessInfos.forEach((business: any) => {
          businessVerificationMap.set(business.id, Boolean(business.verified));
        });
      }
    }

    // Fetch responses for each review
    const reviewIds = uniqueReviews.map((r: any) => r.id);
    let responsesMap = new Map();

    if (reviewIds.length > 0) {
      const { data: responses, error: responsesError } = await supabaseSimple
        .from('responses')
        .select('*')
        .in('review_id', reviewIds)
        .order('created_at', { ascending: true });

      if (!responsesError && responses) {
        // Group responses by review_id
        responses.forEach((response: any) => {
          const reviewResponses = responsesMap.get(response.review_id) || [];
          reviewResponses.push(response);
          responsesMap.set(response.review_id, reviewResponses);
        });
      }
    }

    // Format reviews with business profile and response data
    const reviewsWithBusinessProfile = uniqueReviews.map((review: any) => {
      const businessProfile = businessProfilesMap.get(review.business_id);
      const isVerified = businessVerificationMap.get(review.business_id) || false;
      const reviewResponses = responsesMap.get(review.id) || [];

      return {
        id: review.id,
        reviewerId: review.business_id,
        reviewerName: businessProfile?.name || "Unknown Business",
        reviewerAvatar: businessProfile?.avatar || "",
        reviewerVerified: isVerified,
        customerId: currentUser.id,
        customerName: review.customer_name || currentUser.name,
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        address: review.customer_address || "",
        city: review.customer_city || "",
        zipCode: review.customer_zipcode || "",
        reactions: { like: [], funny: [], useful: [], ohNo: [] },
        responses: reviewResponses.map((resp: any) => ({
          id: resp.id,
          authorId: resp.author_id,
          authorName: "Customer Response",
          content: resp.content,
          createdAt: resp.created_at
        }))
      };
    });

    console.log("Reviews with business profile and response data:", reviewsWithBusinessProfile);
    console.log("=== REVIEW FETCH COMPLETE ===");

    return reviewsWithBusinessProfile;
  } else {
    // For business users, fetch reviews they've written
    console.log("Fetching reviews for business account...");
    
    const { data: businessReviews, error: businessError } = await supabaseSimple
      .from('reviews')
      .select('*')
      .eq('business_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (businessError) {
      console.error("Error fetching business reviews:", businessError);
      return [];
    }

    console.log("Business reviews found:", businessReviews?.length || 0);
    return businessReviews || [];
  }
};