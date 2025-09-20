import { createClient } from '@supabase/supabase-js';
import { Review } from '@/types';

const SUPABASE_URL = "https://yftvcixhifvrovwhtgtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHZjaXhoaWZ2cm92d2h0Z3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODY1ODQsImV4cCI6MjA2MTU2MjU4NH0.dk0-iM54olbkNnCEb92-KNsIeDw9u2owEg4B-fh5ggc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchCarouselReviews = async (): Promise<Review[]> => {
  try {
    // Fetch more reviews to have a larger pool for variety
    // We'll get 24 recent reviews and randomly select from them
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(24); // Get 24 reviews for more variety

    if (error) {
      console.error("Error fetching carousel reviews:", error);
      return getFallbackReviews();
    }

    if (!reviews || reviews.length === 0) {
      return getFallbackReviews();
    }

    // Get unique business IDs for profile data
    const businessIds = [...new Set(reviews.map(r => r.business_id).filter(Boolean))];

    // Fetch business profiles
    const { data: businessProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', businessIds);

    // Fetch business verification status
    const { data: businessInfos } = await supabase
      .from('business_info')
      .select('id, verified')
      .in('id', businessIds);

    // Create maps for quick lookup
    const profileMap = new Map(businessProfiles?.map(p => [p.id, p]) || []);
    const verifiedMap = new Map(businessInfos?.map(b => [b.id, Boolean(b.verified)]) || []);

    // Transform to Review format
    const formattedReviews: Review[] = reviews.map(review => {
      const businessProfile = profileMap.get(review.business_id);
      const isVerified = verifiedMap.get(review.business_id) || false;

      return {
        id: review.id,
        reviewerId: review.business_id,
        reviewerName: businessProfile?.name || "Business Owner",
        reviewerAvatar: businessProfile?.avatar || "",
        reviewerVerified: isVerified,
        customerId: "preview-customer",
        customerName: review.customer_name || "Customer",
        customerAvatar: "",
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        address: review.customer_address || "",
        city: review.customer_city || "",
        zipCode: review.customer_zipcode || "",
        reactions: { like: [], funny: [], ohNo: [] }
      };
    });

    return formattedReviews;

  } catch (error) {
    console.error("Error in fetchCarouselReviews:", error);
    return getFallbackReviews();
  }
};

// Fallback sample reviews for when database is empty or unavailable
const getFallbackReviews = (): Review[] => {
  return [
    {
      id: "sample-1",
      reviewerId: "business-1",
      reviewerName: "Mike's Plumbing Service",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-1",
      customerName: "Sarah Johnson",
      customerAvatar: "",
      rating: 5,
      content: "Sarah was an excellent customer! She was ready when we arrived, had cleared the work area, and was very respectful throughout the service call. Payment was quick and easy. Would definitely work with her again!",
      date: new Date().toISOString(),
      address: "123 Main St",
      city: "Springfield",
      zipCode: "12345",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-2",
      reviewerId: "business-2",
      reviewerName: "Elite Auto Repair",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-2",
      customerName: "Robert Chen",
      customerAvatar: "",
      rating: 4,
      content: "Robert brought his car in for brake service. He was punctual for his appointment and understood the work needed. Great communication throughout the process. The only minor issue was payment took a bit longer than expected.",
      date: new Date(Date.now() - 86400000).toISOString(),
      address: "456 Oak Ave",
      city: "Springfield",
      zipCode: "12346",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-3",
      reviewerId: "business-3",
      reviewerName: "Fresh Clean Housekeeping",
      reviewerAvatar: "",
      reviewerVerified: false,
      customerId: "customer-3",
      customerName: "Maria Rodriguez",
      customerAvatar: "",
      rating: 5,
      content: "Maria is a dream client! Her home was well-organized before we arrived, she provided clear instructions about her preferences, and she's always been flexible with scheduling. Highly recommend working with her!",
      date: new Date(Date.now() - 172800000).toISOString(),
      address: "789 Pine St",
      city: "Springfield",
      zipCode: "12347",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-4",
      reviewerId: "business-4",
      reviewerName: "Green Thumb Landscaping",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-4",
      customerName: "David Wilson",
      customerAvatar: "",
      rating: 3,
      content: "David hired us for lawn maintenance. While he pays on time, there have been some communication challenges about scheduling changes. He's particular about certain details which can make the job more time-consuming.",
      date: new Date(Date.now() - 259200000).toISOString(),
      address: "321 Elm St",
      city: "Springfield",
      zipCode: "12348",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-5",
      reviewerId: "business-5",
      reviewerName: "TechFix Computer Repair",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-5",
      customerName: "Jennifer Adams",
      customerAvatar: "",
      rating: 5,
      content: "Jennifer brought in her laptop for virus removal. She was patient while we explained the process, provided all necessary passwords promptly, and picked up exactly when scheduled. Professional and courteous throughout!",
      date: new Date(Date.now() - 345600000).toISOString(),
      address: "654 Birch Ln",
      city: "Springfield",
      zipCode: "12349",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-6",
      reviewerId: "business-6",
      reviewerName: "Perfect Paint Pro",
      reviewerAvatar: "",
      reviewerVerified: false,
      customerId: "customer-6",
      customerName: "Michael Brown",
      customerAvatar: "",
      rating: 4,
      content: "Michael hired us to paint his living room. He was well-prepared with furniture moved and walls cleaned. Good communication about color choices. Only issue was he requested several small touch-ups after completion.",
      date: new Date(Date.now() - 432000000).toISOString(),
      address: "987 Cedar Dr",
      city: "Springfield",
      zipCode: "12350",
      reactions: { like: [], funny: [], ohNo: [] }
    }
  ];
};