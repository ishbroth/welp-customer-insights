
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

  // Debug logging for review data
  console.log(`ReviewItem DEBUG - Review ID: ${review.id}`);
  console.log(`ReviewItem DEBUG - Rating: ${review.rating}`);
  console.log(`ReviewItem DEBUG - Verified: ${review.reviewerVerified}`);
  console.log(`ReviewItem DEBUG - Full review object:`, review);

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

  const handleReviewClaimed = () => {
    console.log('Review claimed, triggering update');
    if (onReviewUpdate) {
      onReviewUpdate();
    }
  };

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 relative">
      {/* Use the actual ReviewCard component instead of separate header/content */}
      <div className="border-b border-gray-100 pb-4 last:border-b-0">
        <div className="flex justify-between items-start">
          {/* Left side: Rating, Business name, Date */}
          <div className="flex flex-col space-y-2">
            {/* Star rating */}
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className={`h-5 w-5 ${
                    i < (Number(review.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </div>
              ))}
            </div>
            
            {/* Business name */}
            <div>
              {(isSubscribed || hasFullAccess) ? (
                <h4 className="font-semibold text-base cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                  {review.reviewerName}
                </h4>
              ) : (
                <h4 className="font-semibold text-base">{review.reviewerName}</h4>
              )}
            </div>
            
            {/* Date */}
            <p className="text-sm text-gray-500">
              {new Date(review.date).toLocaleDateString()}
            </p>
          </div>

          {/* Right side: Verified badge and Avatar */}
          <div className="flex items-center space-x-3">
            {/* DEBUG: Add visible indicator for verification status */}
            <div className="text-xs text-gray-500">
              Verified: {review.reviewerVerified ? 'YES' : 'NO'}
            </div>
            
            {/* Verified badge - positioned before the avatar */}
            {review.reviewerVerified && (
              <div 
                className="relative inline-flex items-center justify-center bg-blue-600 rounded-full h-5 w-5" 
                aria-label="Verified business"
              >
                <div className="text-white h-3 w-3">✓</div>
              </div>
            )}
            
            {/* Business avatar placeholder */}
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold">
              {review.reviewerName ? review.reviewerName.charAt(0) : 'B'}
            </div>
          </div>
        </div>

        {/* Review content */}
        <div className="mt-4">
          <p className="text-gray-700 leading-relaxed">
            {fullReviewContent || review.content}
          </p>
        </div>

        {/* Customer information - only show if user has full access */}
        {hasFullAccess && (customerData || review.customer_name) && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              {customerData ? (
                <>
                  <div>
                    <span className="font-medium">Name:</span> {customerData.firstName} {customerData.lastName}
                  </div>
                  {customerData.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {customerData.phone}
                    </div>
                  )}
                  {customerData.address && (
                    <div>
                      <span className="font-medium">Address:</span> {customerData.address}
                    </div>
                  )}
                  {customerData.city && customerData.state && (
                    <div>
                      <span className="font-medium">Location:</span> {customerData.city}, {customerData.state} {customerData.zipCode}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {review.customer_name && (
                    <div>
                      <span className="font-medium">Name:</span> {review.customer_name}
                    </div>
                  )}
                  {review.customer_phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {review.customer_phone}
                    </div>
                  )}
                  {review.customer_address && (
                    <div>
                      <span className="font-medium">Address:</span> {review.customer_address}
                    </div>
                  )}
                  {(review.customer_city || review.customer_zipcode) && (
                    <div>
                      <span className="font-medium">Location:</span> {review.customer_city} {review.customer_zipcode}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

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
