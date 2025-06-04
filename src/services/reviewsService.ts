
import { supabase } from "@/integrations/supabase/client";

export const fetchCustomerReviewsFromDB = async (currentUser: any) => {
  console.log("=== FETCHING REVIEWS FOR USER ===");
  console.log("User type:", currentUser.type);
  console.log("User ID:", currentUser.id);
  console.log("User name:", currentUser.name);
  
  if (currentUser.type === "customer") {
    console.log("Fetching reviews for customer account...");
    
    // Search 1: Direct customer_id match
    const { data: directReviews, error: directError } = await supabase
      .from('reviews')
      .select(`
        id, 
        rating, 
        content, 
        created_at,
        business_id,
        customer_name,
        customer_address,
        customer_city,
        customer_zipcode
      `)
      .eq('customer_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (directError) {
      console.error("Error fetching direct reviews:", directError);
    }

    console.log("Search 1 found", directReviews?.length || 0, "reviews");
    let allReviews = directReviews || [];

    // Search 2: By customer name if we have a name and no direct matches
    if ((!directReviews || directReviews.length === 0) && currentUser?.name) {
      console.log("Searching by customer name:", currentUser.name);
      
      const { data: nameReviews, error: nameError } = await supabase
        .from('reviews')
        .select(`
          id, 
          rating, 
          content, 
          created_at,
          business_id,
          customer_name,
          customer_address,
          customer_city,
          customer_zipcode
        `)
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
    const uniqueReviews = allReviews.filter((review, index, self) => 
      index === self.findIndex(r => r.id === review.id)
    );

    console.log("Total unique reviews found:", uniqueReviews.length);

    // Now fetch business profile data and verification status for each review
    const businessIds = [...new Set(uniqueReviews.map(r => r.business_id).filter(Boolean))];
    console.log("Fetching business data for IDs:", businessIds);

    let businessProfilesMap = new Map();
    let businessVerificationMap = new Map();

    if (businessIds.length > 0) {
      // Fetch business profiles
      const { data: businessProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, avatar, type')
        .in('id', businessIds)
        .eq('type', 'business');

      if (!profileError && businessProfiles) {
        businessProfiles.forEach(profile => {
          businessProfilesMap.set(profile.id, profile);
        });
      }

      // Fetch business verification statuses
      const { data: businessInfos, error: businessError } = await supabase
        .from('business_info')
        .select('id, verified')
        .in('id', businessIds);

      if (!businessError && businessInfos) {
        businessInfos.forEach(business => {
          businessVerificationMap.set(business.id, Boolean(business.verified));
        });
      }
    }

    // Fetch responses for each review
    const reviewIds = uniqueReviews.map(r => r.id);
    let responsesMap = new Map();

    if (reviewIds.length > 0) {
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select(`
          id,
          review_id,
          author_id,
          content,
          created_at
        `)
        .in('review_id', reviewIds)
        .order('created_at', { ascending: true });

      if (!responsesError && responses) {
        // Group responses by review_id
        responses.forEach(response => {
          const reviewResponses = responsesMap.get(response.review_id) || [];
          reviewResponses.push(response);
          responsesMap.set(response.review_id, reviewResponses);
        });
      }
    }

    // Format reviews with business profile and response data
    const reviewsWithBusinessProfile = uniqueReviews.map(review => {
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
        responses: reviewResponses.map(resp => ({
          id: resp.id,
          authorId: resp.author_id,
          authorName: "Customer Response", // Would need to fetch author profile if needed
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
    
    const { data: businessReviews, error: businessError } = await supabase
      .from('reviews')
      .select(`
        id,
        customer_id,
        customer_name,
        customer_address,
        customer_city,
        customer_zipcode,
        customer_phone,
        rating,
        content,
        created_at
      `)
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
