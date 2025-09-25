import { createClient } from '@supabase/supabase-js';
import { Review } from '@/types';

const SUPABASE_URL = "https://yftvcixhifvrovwhtgtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHZjaXhoaWZ2cm92d2h0Z3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODY1ODQsImV4cCI6MjA2MTU2MjU4NH0.dk0-iM54olbkNnCEb92-KNsIeDw9u2owEg4B-fh5ggc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchCarouselReviews = async (): Promise<Review[]> => {
  try {
    // Fetch real reviews from database
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(24); // Get 24 recent reviews for variety

    if (error) {
      console.error("Error fetching carousel reviews:", error);
      // If database error, just use fallback reviews
      return getFallbackReviews();
    }

    // Always get fallback reviews to mix with database reviews
    const fallbackReviews = getFallbackReviews();

    if (!reviews || reviews.length === 0) {
      // No database reviews yet, use all fallback reviews
      console.log("No database reviews found, using fallback reviews only");
      return fallbackReviews;
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

    // Transform database reviews to Review format
    const formattedDatabaseReviews: Review[] = reviews.map(review => {
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

    // Combine database reviews with fallback reviews
    // As database grows, we'll use proportionally more real reviews
    const totalDesired = 24; // Target total reviews for carousel
    const databaseCount = formattedDatabaseReviews.length;

    if (databaseCount >= totalDesired) {
      // Enough database reviews, use only database reviews
      console.log(`Using ${databaseCount} database reviews only`);
      return formattedDatabaseReviews.slice(0, totalDesired);
    } else {
      // Mix database and fallback reviews
      const fallbackNeeded = totalDesired - databaseCount;
      const selectedFallbackReviews = fallbackReviews.slice(0, fallbackNeeded);

      console.log(`Mixing ${databaseCount} database reviews with ${selectedFallbackReviews.length} fallback reviews`);

      // Combine and shuffle for variety
      const combinedReviews = [...formattedDatabaseReviews, ...selectedFallbackReviews];
      return combinedReviews;
    }

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
      city: "Irvine, TX",
      zipCode: "75060",
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
      city: "Fort Wayne, IN",
      zipCode: "46805",
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
      city: "Orlando, FL",
      zipCode: "32801",
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
      rating: 1,
      content: "David is a complete scam artist who tried to dispute legitimate charges after the work was completed. Avoid at all costs.",
      date: new Date(Date.now() - 259200000).toISOString(),
      address: "321 Elm St",
      city: "Phoenix, AZ",
      zipCode: "85001",
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
      city: "Seattle, WA",
      zipCode: "98101",
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
      city: "Denver, CO",
      zipCode: "80201",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-7",
      reviewerId: "business-7",
      reviewerName: "Sunny Side Café",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-7",
      customerName: "Emily Watson",
      customerAvatar: "",
      rating: 5,
      content: "Emily is a regular customer who always brightens our day! She's polite to staff, keeps her table tidy, and tips generously. A pleasure to serve!",
      date: new Date(Date.now() - 518400000).toISOString(),
      address: "412 Maple Ave",
      city: "Nashville, TN",
      zipCode: "37201",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-8",
      reviewerId: "business-8",
      reviewerName: "QuickFix Appliance Repair",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-8",
      customerName: "James Thompson",
      customerAvatar: "",
      rating: 4,
      content: "James called us for a refrigerator repair. He was home when scheduled and had the appliance accessible. Payment was prompt. Would work with him again, though he asked many technical questions during the repair.",
      date: new Date(Date.now() - 604800000).toISOString(),
      address: "738 Willow Rd",
      city: "Portland, OR",
      zipCode: "97201",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-9",
      reviewerId: "business-9",
      reviewerName: "Bella Vista Salon",
      reviewerAvatar: "",
      reviewerVerified: false,
      customerId: "customer-9",
      customerName: "Amanda Foster",
      customerAvatar: "",
      rating: 5,
      content: "Amanda is an ideal client! Always on time, communicates her preferences clearly, and is easy to work with. She appreciates our work and refers friends regularly.",
      date: new Date(Date.now() - 691200000).toISOString(),
      address: "159 Rose Street",
      city: "Atlanta, GA",
      zipCode: "30301",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-10",
      reviewerId: "business-10",
      reviewerName: "Ace Moving Company",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-10",
      customerName: "Carlos Martinez",
      customerAvatar: "",
      rating: 1,
      content: "Carlos was caught stealing items during the move. Had to contact authorities. Extremely unprofessional and dishonest customer.",
      date: new Date(Date.now() - 777600000).toISOString(),
      address: "863 Valley Dr",
      city: "Toronto, ON",
      zipCode: "M5V 1A1",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-11",
      reviewerId: "business-11",
      reviewerName: "Riverside Pet Grooming",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-11",
      customerName: "Lisa Harper",
      customerAvatar: "",
      rating: 5,
      content: "Lisa brings her golden retriever in monthly. Her dog is well-behaved and she always follows our pre-grooming instructions perfectly. Great communication and always appreciative of our work!",
      date: new Date(Date.now() - 864000000).toISOString(),
      address: "724 Sunset Blvd",
      city: "San Diego, CA",
      zipCode: "92101",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-12",
      reviewerId: "business-12",
      reviewerName: "Golden Gate Catering",
      reviewerAvatar: "",
      reviewerVerified: false,
      customerId: "customer-12",
      customerName: "Steven Lee",
      customerAvatar: "",
      rating: 4,
      content: "Steven booked us for his anniversary party. He provided clear guest count and dietary restrictions upfront. Setup location was ready as promised. Only issue was last-minute menu changes that caused some stress.",
      date: new Date(Date.now() - 950400000).toISOString(),
      address: "395 Hillcrest Ave",
      city: "Vancouver, BC",
      zipCode: "V6B 1A1",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-13",
      reviewerId: "business-13",
      reviewerName: "Downtown Dental",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-13",
      customerName: "Rachel Kim",
      customerAvatar: "",
      rating: 5,
      content: "Rachel is an exemplary patient. Always arrives early, follows pre-appointment instructions, and is cooperative during procedures. She maintains excellent oral hygiene between visits.",
      date: new Date(Date.now() - 1036800000).toISOString(),
      address: "582 Commerce St",
      city: "Austin, TX",
      zipCode: "73301",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-14",
      reviewerId: "business-14",
      reviewerName: "Precision Lawn Care",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-14",
      customerName: "Kevin O'Brien",
      customerAvatar: "",
      rating: 1,
      content: "Kevin refused to pay after service was completed and became verbally abusive toward our staff. Will not work with this individual again.",
      date: new Date(Date.now() - 1123200000).toISOString(),
      address: "147 Grove Lane",
      city: "Boston, MA",
      zipCode: "02101",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-15",
      reviewerId: "business-15",
      reviewerName: "Harbor View Photography",
      reviewerAvatar: "",
      reviewerVerified: false,
      customerId: "customer-15",
      customerName: "Nicole Davis",
      customerAvatar: "",
      rating: 5,
      content: "Nicole hired us for her wedding photos. She was organized, followed our timeline perfectly, and made our job easy with great energy and cooperation. The whole bridal party was a joy to work with!",
      date: new Date(Date.now() - 1209600000).toISOString(),
      address: "926 Oceanview Dr",
      city: "Miami, FL",
      zipCode: "33101",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-16",
      reviewerId: "business-16",
      reviewerName: "Urban Fitness Studio",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-16",
      customerName: "Marcus Williams",
      customerAvatar: "",
      rating: 1,
      content: "Marcus was found using fake membership credentials and harassing female members. Banned from our facility immediately.",
      date: new Date(Date.now() - 1296000000).toISOString(),
      address: "341 Industrial Blvd",
      city: "Chicago, IL",
      zipCode: "60601",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-17",
      reviewerId: "business-17",
      reviewerName: "Artisan Bakery",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-17",
      customerName: "Sophie Chen",
      customerAvatar: "",
      rating: 5,
      content: "Sophie ordered custom cupcakes for her daughter's birthday. She provided clear specifications, picked up exactly on time, and was delighted with the results. Always a pleasure to work with!",
      date: new Date(Date.now() - 1382400000).toISOString(),
      address: "678 Harbor Street",
      city: "Halifax, NS",
      zipCode: "B3H 1A1",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-18",
      reviewerId: "business-18",
      reviewerName: "Summit HVAC Services",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-18",
      customerName: "Daniel Rodriguez",
      customerAvatar: "",
      rating: 1,
      content: "Daniel attempted to pay with fraudulent checks and then disappeared when confronted. This man cannot be trusted.",
      date: new Date(Date.now() - 1468800000).toISOString(),
      address: "253 Mountain View Rd",
      city: "Salt Lake City, UT",
      zipCode: "84101",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-19",
      reviewerId: "business-19",
      reviewerName: "Elegant Events Planning",
      reviewerAvatar: "",
      reviewerVerified: false,
      customerId: "customer-19",
      customerName: "Isabella Taylor",
      customerAvatar: "",
      rating: 5,
      content: "Isabella was fantastic to work with on her corporate event. She had a clear vision, stayed within budget, and trusted our expertise. The event was a huge success and she was appreciative throughout the entire process.",
      date: new Date(Date.now() - 1555200000).toISOString(),
      address: "847 Executive Plaza",
      city: "Minneapolis, MN",
      zipCode: "55401",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-20",
      reviewerId: "business-20",
      reviewerName: "Neighborhood Grocery",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-20",
      customerName: "Thomas Anderson",
      customerAvatar: "",
      rating: 4,
      content: "Thomas is a regular customer who shops weekly. He's polite to staff and organizes his items nicely on the checkout belt. Sometimes uses expired coupons which causes minor delays, but overall a good customer.",
      date: new Date(Date.now() - 1641600000).toISOString(),
      address: "492 Suburban Lane",
      city: "Calgary, AB",
      zipCode: "T2P 1A1",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-21",
      reviewerId: "business-21",
      reviewerName: "Elite Hair Studio",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-21",
      customerName: "Jessica Parker",
      customerAvatar: "",
      rating: 3,
      content: "Jessica booked a hair appointment but showed up 30 minutes late without calling. The service went well once we started, but the delay affected other clients. She was apologetic about the timing issue.",
      date: new Date(Date.now() - 1728000000).toISOString(),
      address: "615 Fashion Ave",
      city: "Las Vegas, NV",
      zipCode: "89101",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-22",
      reviewerId: "business-22",
      reviewerName: "Mountain View Auto",
      reviewerAvatar: "",
      reviewerVerified: false,
      customerId: "customer-22",
      customerName: "Brian Thompson",
      customerAvatar: "",
      rating: 2,
      content: "Brian brought his vehicle for routine maintenance but became argumentative about the pricing mid-service. Payment was eventually made but the interaction was tense and unprofessional on his part.",
      date: new Date(Date.now() - 1814400000).toISOString(),
      address: "823 Summit Dr",
      city: "Albuquerque, NM",
      zipCode: "87101",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-23",
      reviewerId: "business-23",
      reviewerName: "City Center Cleaners",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-23",
      customerName: "Patricia Miller",
      customerAvatar: "",
      rating: 3,
      content: "Patricia dropped off dry cleaning but forgot to mention several stains that needed special treatment. When she picked up, she was disappointed with results but understood it was due to lack of communication upfront.",
      date: new Date(Date.now() - 1900800000).toISOString(),
      address: "457 Downtown Blvd",
      city: "Richmond, VA",
      zipCode: "23218",
      reactions: { like: [], funny: [], ohNo: [] }
    },
    {
      id: "sample-24",
      reviewerId: "business-24",
      reviewerName: "Riverside Veterinary",
      reviewerAvatar: "",
      reviewerVerified: true,
      customerId: "customer-24",
      customerName: "Mark Stevens",
      customerAvatar: "",
      rating: 2,
      content: "Mark scheduled an appointment for his dog but didn't follow pre-visit instructions about fasting. This complicated the procedure and he seemed frustrated with our policies, though we explained them clearly during booking.",
      date: new Date(Date.now() - 1987200000).toISOString(),
      address: "392 Riverside Dr",
      city: "Winnipeg, MB",
      zipCode: "R3B 1A1",
      reactions: { like: [], funny: [], ohNo: [] }
    }
  ];
};