import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const serviceLogger = logger.withContext('Reviews');

export const fetchCustomerReviewsFromDB = async (currentUser: any) => {
  serviceLogger.debug("=== FETCHING REVIEWS FOR USER ===");
  serviceLogger.debug("User type:", currentUser.type);
  serviceLogger.debug("User ID:", currentUser.id);
  serviceLogger.debug("User name:", currentUser.name);

  if (currentUser.type === "customer") {
    serviceLogger.debug("Fetching reviews for customer account...");
    
    let allReviews: any[] = [];

    // Search 1: Reviews claimed by this customer
    const { data: claimedReviews, error: claimedError } = await supabase
      .from('review_claims')
      .select(`
        reviews (
          id, business_id, rating, content, customer_name, customer_address,
          customer_city, customer_state, customer_zipcode, customer_phone, created_at, updated_at
        )
      `)
      .eq('claimed_by', currentUser.id);

    if (claimedError) {
      serviceLogger.error("Error fetching claimed reviews:", claimedError);
    } else {
      const reviewsFromClaims = claimedReviews?.map((claim: any) => claim.reviews).filter(Boolean) || [];
      serviceLogger.debug("Search 1 (claimed reviews) found", reviewsFromClaims.length, "reviews");
      allReviews = [...allReviews, ...reviewsFromClaims];
    }

    // Search 2: By customer name if we have a name
    if (currentUser?.name) {
      serviceLogger.debug("Searching by customer name:", currentUser.name);

      const { data: nameReviews, error: nameError } = await supabase
        .from('reviews')
        .select('id, business_id, content, rating, customer_name, customer_nickname, customer_business_name, customer_address, customer_city, customer_state, customer_zipcode, customer_phone, associates, is_anonymous, created_at, updated_at, deleted_at')
        .ilike('customer_name', `%${currentUser.name}%`)
        .order('created_at', { ascending: false });

      if (nameError) {
        serviceLogger.error("Error fetching reviews by name:", nameError);
      } else {
        serviceLogger.debug("Search 2 found", nameReviews?.length || 0, "reviews");
        allReviews = [...allReviews, ...(nameReviews || [])];
      }
    }

    // Remove duplicates based on review ID
    const uniqueReviews = allReviews.filter((review: any, index: number, self: any[]) =>
      index === self.findIndex((r: any) => r.id === review.id)
    );

    serviceLogger.debug("Total unique reviews found:", uniqueReviews.length);

    // Now fetch business profile data and verification status for each review
    const businessIds = [...new Set(uniqueReviews.map((r: any) => r.business_id).filter(Boolean))];
    serviceLogger.debug("Fetching business data for IDs:", businessIds);

    let businessProfilesMap = new Map();
    let businessVerificationMap = new Map();

    if (businessIds.length > 0) {
      // Fetch business profiles
      const { data: businessProfiles, error: profileError } = await supabase
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
      const { data: businessInfos, error: businessError } = await supabase
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
      const { data: responses, error: responsesError } = await supabase
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
        reviewerBusinessCategory: businessProfile?.business_category,
        customerId: currentUser.id,
        customerName: review.customer_name || currentUser.name,
        customer_business_name: review.customer_business_name,
        customer_nickname: review.customer_nickname,
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        address: review.customer_address || "",
        city: review.customer_city || "",
        state: review.customer_state || "",
        zipCode: review.customer_zipcode || "",
        associates: review.associates || [],
        is_anonymous: review.is_anonymous || false,
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

    serviceLogger.debug("Reviews with business profile and response data:", reviewsWithBusinessProfile);
    serviceLogger.debug("=== REVIEW FETCH COMPLETE ===");

    return reviewsWithBusinessProfile;
  } else {
    // For business users, fetch reviews they've written
    serviceLogger.debug("Fetching reviews for business account...");

    const { data: businessReviews, error: businessError } = await supabase
      .from('reviews')
      .select('id, business_id, content, rating, customer_name, customer_nickname, customer_business_name, customer_address, customer_city, customer_state, customer_zipcode, customer_phone, associates, is_anonymous, created_at, updated_at, deleted_at')
      .eq('business_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (businessError) {
      serviceLogger.error("Error fetching business reviews:", businessError);
      return [];
    }

    serviceLogger.debug("Business reviews found:", businessReviews?.length || 0);
    serviceLogger.debug("Raw business reviews from database:", businessReviews);
    serviceLogger.debug("REVIEWS SERVICE - First review nickname:", businessReviews?.[0]?.customer_nickname);
    serviceLogger.debug("REVIEWS SERVICE - First review business name:", businessReviews?.[0]?.customer_business_name);
    serviceLogger.debug("REVIEWS SERVICE - First review is_anonymous:", businessReviews?.[0]?.is_anonymous);

    // Transform business reviews to match expected format
    serviceLogger.debug("REVIEWS SERVICE - Transforming reviews, first review data:", businessReviews?.[0]);
    const transformedBusinessReviews = (businessReviews || []).map((review: any) => {
      serviceLogger.debug("REVIEWS SERVICE - Transforming review:", {
        id: review.id,
        customer_nickname: review.customer_nickname,
        customer_business_name: review.customer_business_name,
        is_anonymous: review.is_anonymous
      });
      return {
        id: review.id,
        reviewerId: currentUser.id,
        reviewerName: currentUser.name || "Business Owner",
        reviewerAvatar: currentUser.avatar || "",
        reviewerVerified: Boolean(currentUser.verified),
        reviewerBusinessCategory: currentUser.business_category,
        customerId: null,
        customerName: review.customer_name || "Customer",
        customer_business_name: review.customer_business_name,
        customer_nickname: review.customer_nickname,
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        address: review.customer_address || "",
        city: review.customer_city || "",
        state: review.customer_state || "",
        zipCode: review.customer_zipcode || "",
        associates: review.associates || [],
        is_anonymous: review.is_anonymous || false,
        reactions: { like: [], funny: [], useful: [], ohNo: [] },
        responses: []
      };
    });

    return transformedBusinessReviews;
  }
};