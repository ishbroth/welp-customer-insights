
import { useAuth } from "@/contexts/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import ReviewRating from "./ReviewRating";
import ReviewBusinessInfo from "./ReviewBusinessInfo";
import ReviewBusinessAvatar from "./ReviewBusinessAvatar";
import ReviewContent from "./ReviewContent";
import ReviewCustomerInfo from "./ReviewCustomerInfo";

interface ReviewCardProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    customerId?: string;
    responses?: Array<{
      id: string;
      authorId: string;
      authorName: string;
      content: string;
      createdAt: string;
    }>;
  };
  hasFullAccess: boolean;
  customerData?: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    avatar?: string;
  };
}

const ReviewCard = ({ review, hasFullAccess, customerData }: ReviewCardProps) => {
  const { isSubscribed } = useAuth();

  // Fetch customer profile if we have customerId but no customer data
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      console.log(`ReviewCard: Fetching customer profile for ID: ${review.customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("ReviewCard: Error fetching customer profile:", error);
        return null;
      }

      console.log(`ReviewCard: Customer profile found:`, data);
      return data;
    },
    enabled: !!review.customerId && !customerData?.avatar
  });

  // Fetch enhanced responses with proper author names
  const { data: enhancedResponses } = useQuery({
    queryKey: ['reviewResponses', review.id],
    queryFn: async () => {
      console.log(`ReviewCard: Fetching responses for review ${review.id}`);
      console.log(`ReviewCard: Customer data available:`, customerData);
      console.log(`ReviewCard: Review customer_name:`, review.customer_name);
      console.log(`ReviewCard: Review customerId:`, review.customerId);
      
      // First get the responses
      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .select('id, author_id, content, created_at')
        .eq('review_id', review.id)
        .order('created_at', { ascending: true });

      if (responseError) {
        console.error('ReviewCard: Error fetching responses:', responseError);
        return review.responses || [];
      }

      if (!responseData || responseData.length === 0) {
        return [];
      }

      console.log('ReviewCard: Raw response data:', responseData);

      // Get author information for each response
      const authorIds = responseData.map(r => r.author_id).filter(Boolean);
      
      if (authorIds.length === 0) {
        return [];
      }

      console.log('ReviewCard: Author IDs to fetch:', authorIds);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, first_name, last_name, type')
        .in('id', authorIds);

      if (profileError) {
        console.error('ReviewCard: Error fetching author profiles:', profileError);
        return review.responses || [];
      }

      console.log('ReviewCard: Profile data found:', profileData);

      // Enhanced logic to get proper names, especially for customer responses
      const formattedResponses = responseData.map((resp: any) => {
        const profile = profileData?.find(p => p.id === resp.author_id);
        
        let authorName = 'User'; // Default fallback
        
        console.log(`\n=== PROCESSING RESPONSE ${resp.id} ===`);
        console.log(`Response author_id: ${resp.author_id}`);
        console.log(`Review customerId: ${review.customerId}`);
        console.log(`CustomerData:`, customerData);
        console.log(`Review customer_name: ${review.customer_name}`);
        console.log(`Profile found:`, profile);
        
        // PRIORITY 1: If this response is from the customer that the review is about
        if (resp.author_id === review.customerId) {
          console.log('✅ Response is from the customer that the review is about');
          
          // Use customerData first (this should be Isaac Wiley)
          if (customerData && (customerData.firstName || customerData.lastName)) {
            authorName = `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim();
            console.log(`✅ Using customerData for name: "${authorName}"`);
          } 
          // Then try review.customer_name
          else if (review.customer_name && review.customer_name.trim()) {
            authorName = review.customer_name;
            console.log(`✅ Using review.customer_name for name: "${authorName}"`);
          } 
          // Finally try profile data
          else if (profile) {
            if (profile.first_name && profile.last_name) {
              authorName = `${profile.first_name} ${profile.last_name}`;
              console.log(`✅ Using profile first+last name: "${authorName}"`);
            } else if (profile.first_name) {
              authorName = profile.first_name;
              console.log(`✅ Using profile first name: "${authorName}"`);
            } else if (profile.last_name) {
              authorName = profile.last_name;
              console.log(`✅ Using profile last name: "${authorName}"`);
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using profile name field: "${authorName}"`);
            }
          } else {
            console.log('❌ No name source available, using fallback');
          }
        }
        // PRIORITY 2: If we have profile data for other users
        else if (profile) {
          console.log('📝 Processing response from other user');
          // For customer accounts, prefer the constructed name from first_name + last_name
          if (profile.type === 'customer') {
            if (profile.first_name && profile.last_name) {
              authorName = `${profile.first_name} ${profile.last_name}`;
            } else if (profile.first_name) {
              authorName = profile.first_name;
            } else if (profile.last_name) {
              authorName = profile.last_name;
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            } else {
              authorName = 'Customer';
            }
          } else {
            // For business accounts, prefer the name field
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
            } else {
              authorName = profile.type === 'business' ? 'Business' : 'User';
            }
          }
          
          console.log(`📝 Final name for other user: "${authorName}"`);
        } else {
          console.log(`❌ No profile found for author ${resp.author_id}`);
        }

        console.log(`🎯 FINAL AUTHOR NAME: "${authorName}"`);
        console.log(`=== END PROCESSING RESPONSE ${resp.id} ===\n`);

        return {
          id: resp.id,
          authorId: resp.author_id || '',
          authorName,
          content: resp.content,
          createdAt: resp.created_at
        };
      });

      console.log('ReviewCard: Enhanced responses with proper author names:', formattedResponses);
      return formattedResponses;
    },
    enabled: !!review.id
  });

  // Get final customer avatar - prefer customerData, then fetched profile
  const finalCustomerAvatar = customerData?.avatar || customerProfile?.avatar || '';

  // Use enhanced responses if available, otherwise fall back to the original responses
  const responsesToUse = enhancedResponses || review.responses || [];

  console.log('ReviewCard: Final responses to display:', responsesToUse);

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex justify-between items-start">
        {/* Left side: Rating, Business name, Date */}
        <div className="flex flex-col space-y-2">
          <ReviewRating rating={review.rating} />
          <ReviewBusinessInfo 
            reviewerName={review.reviewerName}
            reviewerId={review.reviewerId}
            date={review.date}
            hasFullAccess={hasFullAccess}
          />
        </div>

        {/* Right side: Verified badge and Avatar */}
        <ReviewBusinessAvatar 
          reviewerId={review.reviewerId}
          reviewerName={review.reviewerName}
          reviewerVerified={review.reviewerVerified}
        />
      </div>

      <ReviewContent content={review.content} />

      <ReviewCustomerInfo 
        hasFullAccess={hasFullAccess}
        customerData={customerData}
        review={review}
        finalCustomerAvatar={finalCustomerAvatar}
      />

      {/* Response section with enhanced conversation flow */}
      <CustomerReviewResponse 
        reviewId={review.id}
        responses={responsesToUse}
        hasSubscription={isSubscribed}
        isOneTimeUnlocked={hasFullAccess}
        reviewAuthorId={review.reviewerId}
      />
    </div>
  );
};

export default ReviewCard;
