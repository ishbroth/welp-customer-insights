import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Star, MessageCircle, Lock, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import CustomerInfoDisplay from "@/components/review/CustomerInfoDisplay";
import { useCustomerInfo } from "@/hooks/useCustomerInfo";
import ReviewConversationSection from "@/components/conversation/ReviewConversationSection";
import { useReviewAccess } from "@/hooks/useReviewAccess";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { doesReviewMatchUser } from "@/utils/reviewMatching";
import AssociatesDisplay from "@/components/reviews/AssociatesDisplay";
import BusinessReviewCardPhotos from "@/components/business/BusinessReviewCardPhotos";
import { formatCustomerNameWithNickname } from "@/utils/nameFormatter";

interface ReviewCardProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string;
    reviewerVerified?: boolean;
    rating: number;
    content: string;
    date: string;
    customerId?: string;
    customerName: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    customer_business_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    associates?: Array<{ firstName: string; lastName: string }>;
    isAssociateMatch?: boolean;
    original_customer_name?: string;
    associateData?: { firstName: string; lastName: string };
  };
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  hasSubscription,
  isOneTimeUnlocked,
}) => {
  console.log("🔍 SEARCH ReviewCard - Review data:", {
    id: review.id,
    customer_business_name: review.customer_business_name,
    associates: review.associates,
    isAssociateMatch: review.isAssociateMatch
  });
  const navigate = useNavigate();
  const { currentUser, isSubscribed } = useAuth();
  const { balance, useCredits: useCreditsFn, loadCreditsData } = useCredits();
  const { isReviewUnlocked, addUnlockedReview } = useReviewAccess();

  // Check if current user is the business that wrote this review
  const isReviewAuthor = currentUser?.type === 'business' && currentUser?.id === review.reviewerId;
  
  // Check if customer user can access this review (only if it matches their profile)
  const customerCanAccessReview = currentUser?.type === 'customer' 
    ? doesReviewMatchUser(review, currentUser)
    : true; // Business users can access any review
  
  // Use persistent review access check
  const isReviewActuallyUnlocked = isReviewUnlocked(review.id) || isOneTimeUnlocked;
  
  // For review content: customer users must BOTH have access AND profile match, others just need access
  const canViewFullContent = currentUser?.type === 'customer' 
    ? (isSubscribed || isReviewActuallyUnlocked || isReviewAuthor) && customerCanAccessReview
    : (isSubscribed || isReviewActuallyUnlocked || isReviewAuthor);
  
  // For conversation participation: same rule as content viewing
  const canParticipateInConversation = currentUser?.type === 'customer'
    ? (isSubscribed || isReviewActuallyUnlocked || isReviewAuthor) && customerCanAccessReview
    : (isSubscribed || isReviewActuallyUnlocked || isReviewAuthor);

  // Format customer name with nickname before passing to useCustomerInfo
  const formattedCustomerName = formatCustomerNameWithNickname(
    review.customerName,
    review.customer_nickname
  );

  const customerInfo = useCustomerInfo({
    customer_name: formattedCustomerName,
    customer_phone: review.customer_phone,
    customer_address: review.customer_address || review.address,
    customer_city: review.customer_city || review.city,
    customer_zipcode: review.customer_zipcode || review.zipCode,
    customerId: review.customerId
  });

  const handleBusinessNameClick = () => {
    // If current user is the business owner of this review, go to their own profile
    if (currentUser?.id === review.reviewerId) {
      navigate('/profile');
    } else {
      navigate(`/business-profile/${review.reviewerId}`, {
        state: { 
          readOnly: true,
          showRespondButton: currentUser?.type === 'customer',
          reviewId: review.id
        }
      });
    }
  };

  const handleCustomerNameClick = () => {
    if (!customerInfo.isClaimed || !canViewFullContent) return;
    
    navigate(`/customer-profile/${review.customerId}`, {
      state: { 
        readOnly: true,
        showWriteReviewButton: currentUser?.type === 'business'
      }
    });
  };

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleOneTimeAccess = async () => {
    if (!currentUser) {
      sessionStorage.setItem('pendingReviewAccess', JSON.stringify({
        reviewId: review.id,
        accessType: 'one-time'
      }));
      navigate('/login');
      return;
    }
    
    try {
      console.log("Creating credit payment session...");
      const { data, error } = await supabase.functions.invoke('create-credit-payment', {
        body: {
          returnUrl: window.location.href // Return to current search page
        }
      });

      if (error) {
        console.error("Error creating payment session:", error);
        toast.error("Failed to create payment session");
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initiate payment");
    }
  };

  const handleSubscriptionAccess = () => {
    if (!currentUser) {
      sessionStorage.setItem('pendingReviewAccess', JSON.stringify({
        reviewId: review.id,
        accessType: 'subscription'
      }));
      navigate('/login');
      return;
    }
    
    navigate('/subscription');
  };

  const handleUseCreditClick = async () => {
    if (balance < 1) {
      toast.error("Insufficient credits");
      return;
    }

    const result = await useCreditsFn(1, `Unlocked review ${review.id}`);
    if (result.success) {
      // Claim the review with the transaction ID
      const claimed = await addUnlockedReview(review.id, result.transactionId);
      
      if (claimed) {
        loadCreditsData(); // Refresh credit balance
        toast.success("Review unlocked using 1 credit!");
      } else {
        toast.error("This review has already been claimed by another user.");
      }
    }
  };

  // Get first three letters for preview (not words)
  const getPreviewText = (text: string) => {
    return text.substring(0, 3) + '...';
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          {/* Business info - left side */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getInitials(review.reviewerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <h4 
                  className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleBusinessNameClick}
                >
                  {review.reviewerName}
                </h4>
                {review.reviewerVerified && <VerifiedBadge size="xs" />}
              </div>
              <p className="text-sm text-gray-500">Business</p>
            </div>
          </div>

          {/* Customer info - right side (minimal display) */}
          <div className="text-right">
            <CustomerInfoDisplay
              customerInfo={customerInfo}
              onCustomerClick={customerInfo.isClaimed && canViewFullContent ? handleCustomerNameClick : undefined}
              size="small"
              showContactInfo={false}
              hideMatchScore={true}
              reviewCustomerId={review.customerId}
            />
          </div>
        </div>

        {/* Rating and Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    canViewFullContent && i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {canViewFullContent && (
              <span className="text-sm text-gray-600">
                {review.rating}/5
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {formatDate(review.date)}
          </span>
        </div>

        {/* Review Content */}
        <div className="mb-4">
          {canViewFullContent ? (
            <p className="text-gray-700 leading-relaxed md:text-base text-sm">{review.content}</p>
          ) : (
            <div className="relative">
              <p className="text-gray-700 leading-relaxed md:text-base text-sm">
                {getPreviewText(review.content)}
              </p>
            </div>
          )}
        </div>

        {/* Review Photos */}
        <BusinessReviewCardPhotos reviewId={review.id} />

        {/* Associate Match Indicator - show when this result came from searching for an associate */}
        {review.isAssociateMatch && review.associateData && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Found via associate: {`${review.associateData.firstName} ${review.associateData.lastName}`.trim()}
              </span>
            </div>
          </div>
        )}

        {/* Lock/Unlock UI for non-accessible content */}
        {!canViewFullContent && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center text-gray-600 mb-2">
              <Lock className="h-4 w-4 mr-2" />
              <span className="text-sm">Full review locked</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Customers may track their own reviews only.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {customerCanAccessReview && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOneTimeAccess}
                    className="flex-1 text-xs sm:text-sm px-2 py-1"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="truncate">Unlock ($3)</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubscriptionAccess}
                    className="flex-1 text-xs sm:text-sm px-2 py-1"
                  >
                    <span className="truncate">Subscribe</span>
                  </Button>
                </>
              )}
              {!customerCanAccessReview && (
                <p className="text-xs text-gray-500 italic">
                  This review does not match your profile information
                </p>
              )}
            </div>
          </div>
        )}

        {/* Associates and Business Display - split layout (similar to BusinessReviewCard) */}
        {((review.associates && review.associates.length > 0) || review.customer_business_name) && !review.isAssociateMatch && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Associates on the left */}
            {(review.associates && review.associates.length > 0) && (
              <div className="flex-1">
                <AssociatesDisplay
                  associates={review.associates}
                  showBusinessName={false}
                  reviewData={{
                    phone: review.customer_phone || '',
                    address: review.customer_address || review.address || '',
                    city: review.customer_city || review.city || '',
                    state: review.state || '',
                    zipCode: review.customer_zipcode || review.zipCode || ''
                  }}
                />
              </div>
            )}

            {/* Business name on the right */}
            {review.customer_business_name && (
              <div className="flex-1">
                <div className="mt-3">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">🏢</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600 mb-2">Business or Employment:</p>
                      <span className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded-md font-medium">
                        🏢 {review.customer_business_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conversation Section */}
        <ReviewConversationSection 
          reviewId={review.id}
          shouldShowFullReview={canParticipateInConversation}
          isBusinessUser={currentUser?.type === 'business'}
          isCustomerBeingReviewed={currentUser?.id === review.customerId}
          customerId={review.customerId}
          className="mt-4"
        />

        {/* Conversation Access Prompt - Show when review content is visible but conversation participation needs unlock */}
        {canViewFullContent && !canParticipateInConversation && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center text-gray-600 mb-2">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">Unlock conversation to participate</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {isReviewAuthor 
                ? "Even as the review author, you need to unlock or subscribe to participate in conversations"
                : "Subscribe or use credits to participate in the conversation"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {customerCanAccessReview && balance > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUseCreditClick}
                  className="flex-1 text-xs sm:text-sm px-2 py-1"
                >
                  <span className="truncate">Unlock (1 Credit)</span>
                </Button>
              ) : customerCanAccessReview ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOneTimeAccess}
                  className="flex-1 text-xs sm:text-sm px-2 py-1"
                >
                  <span className="truncate">Unlock ($3)</span>
                </Button>
              ) : null}
              {customerCanAccessReview && (
                <Button
                  size="sm"
                  onClick={handleSubscriptionAccess}
                  className="flex-1 text-xs sm:text-sm px-2 py-1"
                >
                  <span className="truncate">Subscribe</span>
                </Button>
              )}
              {!customerCanAccessReview && (
                <p className="text-xs text-gray-500 italic">
                  This review does not match your profile information
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
