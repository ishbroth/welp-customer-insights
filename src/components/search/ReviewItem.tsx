import { useAuth } from "@/contexts/auth";
import PhotoGallery from "@/components/reviews/PhotoGallery";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import ReviewItemHeader from "./ReviewItemHeader";
import ReviewItemContent from "./ReviewItemContent";
import ReviewItemActions from "./ReviewItemActions";
import ClaimReviewButton from "./ClaimReviewButton";
import { useReviewData } from "@/hooks/useReviewData";
import { useCustomerReviewResponses } from "@/hooks/useCustomerReviewResponses";
import { doesReviewMatchUser } from "@/utils/reviewMatching";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewItemProps {
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
  };
  hasFullAccess: boolean;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  customerData?: {
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

const ReviewItem = ({ 
  review, 
  hasFullAccess, 
  onEdit, 
  onDelete, 
  customerData, 
  onReviewUpdate 
}: ReviewItemProps) => {
  const { currentUser, isSubscribed } = useAuth();
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
  const isCustomerUser = currentUser?.type === "customer";
  const { photos, fullReviewContent } = useReviewData(review.id, hasFullAccess);
  const { responses } = useCustomerReviewResponses(review.id);

  // Fetch current user's profile for matching
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, address, city, state, zipcode')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    },
    enabled: !!currentUser?.id && isCustomerUser
  });

  // Check if current user is the business who wrote this review
  const isReviewAuthor = currentUser?.id === review.reviewerId;

  // Check if this review matches the current customer user and is not yet claimed
  const isClaimableReview = isCustomerUser && 
    !review.customerId && 
    doesReviewMatchUser(review, currentUser, userProfile);

  console.log(`ReviewItem: Business ${review.reviewerName} verification status: ${review.reviewerVerified}`);
  console.log(`ReviewItem: Review data passed to header:`, {
    reviewerName: review.reviewerName,
    reviewerId: review.reviewerId,
    reviewerVerified: review.reviewerVerified
  });
  console.log(`ReviewItem: Found ${responses.length} responses for review ${review.id}`);
  console.log(`ReviewItem: Current user ${currentUser?.id} is review author: ${isReviewAuthor}`);
  console.log(`ReviewItem: Review is claimable: ${isClaimableReview}`);

  const handleReviewClaimed = () => {
    console.log('Review claimed, triggering update');
    if (onReviewUpdate) {
      onReviewUpdate();
    }
  };

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 relative">
      <ReviewItemHeader 
        review={review} 
        hasFullAccess={hasFullAccess} 
      />
      
      <ReviewItemContent
        review={review}
        fullReviewContent={fullReviewContent}
        hasFullAccess={hasFullAccess}
        customerData={customerData}
      />

      {/* Show claim button for matching unclaimed reviews */}
      {isClaimableReview && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <p className="font-medium">Is this your review?</p>
              <p>Claim it to link it to your account and display your profile picture.</p>
            </div>
            <ClaimReviewButton
              reviewId={review.id}
              customerName={review.customer_name || 'this customer'}
              onReviewClaimed={handleReviewClaimed}
            />
          </div>
        </div>
      )}

      {/* Photo Gallery - only show if user has full access */}
      <PhotoGallery 
        photos={photos} 
        hasAccess={hasFullAccess}
      />

      {/* Show responses if user has full access */}
      {hasFullAccess && (
        <CustomerReviewResponse
          reviewId={review.id}
          responses={responses}
          hasSubscription={isSubscribed}
          isOneTimeUnlocked={false}
          hideReplyOption={isReviewAuthor}
        />
      )}

      {/* Edit and Delete buttons for current user's reviews */}
      <ReviewItemActions
        review={review}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ReviewItem;
