
import CustomerReviewCard from "@/components/customer/CustomerReviewCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewsListProps {
  reviews: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
    reviewerAvatar?: string;
    customerAvatar?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    customerId?: string;
  }>;
  hasFullAccess: (customerId: string) => boolean;
  customerData?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  onReviewUpdate?: () => void;
}

const ReviewsList = ({ reviews, hasFullAccess, customerData, onReviewUpdate }: ReviewsListProps) => {
  const customerId = customerData?.id || "default-customer-id";

  // Fetch business profiles for avatars
  const businessIds = [...new Set(reviews.map(review => review.reviewerId).filter(Boolean))];
  const { data: businessProfiles } = useQuery({
    queryKey: ['businessProfiles', businessIds],
    queryFn: async () => {
      if (businessIds.length === 0) return [];
      
      console.log(`Fetching business profiles for IDs:`, businessIds);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name')
        .in('id', businessIds);

      if (error) {
        console.error("Error fetching business profiles:", error);
        return [];
      }

      console.log(`Business profiles found:`, data);
      return data || [];
    },
    enabled: businessIds.length > 0
  });

  // Fetch customer profiles for avatars
  const customerIds = [...new Set(reviews.map(review => review.customerId).filter(Boolean))];
  const { data: customerProfiles } = useQuery({
    queryKey: ['customerProfiles', customerIds],
    queryFn: async () => {
      if (customerIds.length === 0) return [];
      
      console.log(`Fetching customer profiles for IDs:`, customerIds);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name')
        .in('id', customerIds);

      if (error) {
        console.error("Error fetching customer profiles:", error);
        return [];
      }

      console.log(`Customer profiles found:`, data);
      return data || [];
    },
    enabled: customerIds.length > 0
  });

  // Create maps for quick lookup
  const businessProfilesMap = new Map(businessProfiles?.map(profile => [profile.id, profile]) || []);
  const customerProfilesMap = new Map(customerProfiles?.map(profile => [profile.id, profile]) || []);

  // Transform reviews to match CustomerReviewCard format with proper avatars
  const transformedReviews = reviews.map(review => {
    const businessProfile = businessProfilesMap.get(review.reviewerId);
    const customerProfile = customerProfilesMap.get(review.customerId || '');
    
    console.log(`Review ${review.id}: Business avatar from profile:`, businessProfile?.avatar);
    console.log(`Review ${review.id}: Customer avatar from profile:`, customerProfile?.avatar);
    
    return {
      id: review.id,
      reviewerId: review.reviewerId,
      reviewerName: review.reviewerName,
      reviewerAvatar: review.reviewerAvatar || businessProfile?.avatar || '',
      rating: review.rating,
      content: review.content,
      date: review.date,
      customerId: review.customerId || customerId,
      customerName: review.customer_name || `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim(),
      address: review.customer_address || customerData?.address,
      city: review.customer_city || customerData?.city,
      state: customerData?.state,
      zipCode: review.customer_zipcode || customerData?.zipCode,
      reviewerVerified: review.reviewerVerified,
      customerAvatar: review.customerAvatar || customerProfile?.avatar || '',
      reactions: { like: [], funny: [], ohNo: [] },
      responses: []
    };
  });

  const handlePurchase = (reviewId: string) => {
    // Handle review purchase logic
    console.log('Purchase review:', reviewId);
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    // Handle reaction toggle logic
    console.log('Toggle reaction:', reactionType, 'for review:', reviewId);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">Reviews ({reviews.length})</h4>
      {transformedReviews.map((review) => (
        <CustomerReviewCard
          key={review.id}
          review={review}
          isUnlocked={hasFullAccess(customerId)}
          hasSubscription={hasFullAccess(customerId)}
          onPurchase={handlePurchase}
          onReactionToggle={handleReactionToggle}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
