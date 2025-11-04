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
import { formatCustomerNameWithNickname, getNameInitials } from "@/utils/nameFormatter";
import { getReviewerDisplayName, canParticipateInConversation } from "@/utils/anonymousReviewUtils";
import { useReviewClaims } from "@/hooks/useReviewClaims";
import { logger } from '@/utils/logger';
import { formatDate } from "@/utils/dateUtils";

interface ReviewCardProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string;
    reviewerVerified?: boolean;
    reviewerBusinessCategory?: string;
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
    is_anonymous?: boolean;
  };
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  hasSubscription,
  isOneTimeUnlocked,
}) => {
  const componentLogger = logger.withContext('SearchReviewCard');
  componentLogger.debug("Review data:", {
    id: review.id,
    customer_business_name: review.customer_business_name,
    associates: review.associates,
    isAssociateMatch: review.isAssociateMatch
  });
  const navigate = useNavigate();
  const { currentUser, isSubscribed } = useAuth();
  const { balance, useCredits: useCreditsFn, loadCreditsData } = useCredits();
  const { isReviewUnlocked, addUnlockedReview } = useReviewAccess();
  const { isReviewClaimedByUser } = useReviewClaims();
  const [isClaimedByCurrentUser, setIsClaimedByCurrentUser] = React.useState<boolean>(false);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  // Check if current user has claimed this review
  React.useEffect(() => {
    if (currentUser?.type === 'customer' && review.id) {
      isReviewClaimedByUser(review.id).then(setIsClaimedByCurrentUser);
    }
  }, [review.id, currentUser?.type]);

  // Check if current user is the business that wrote this review
  const isReviewAuthor = currentUser?.type === 'business' && currentUser?.id === review.reviewerId;

  // Get display name for reviewer (anonymous logic)
  const displayReviewerName = getReviewerDisplayName(
    review.is_anonymous || false,
    review.reviewerName,
    review.reviewerBusinessCategory,
    isReviewAuthor
  );

  // Check if reviewer can participate in conversations (anonymous reviews cannot)
  const reviewerCanParticipate = canParticipateInConversation(
    review.is_anonymous || false,
    isReviewAuthor
  );
  
  // Check if customer user can access this review
  // Customer can access if:
  // 1. Review matches their profile exactly (2/3 fields) OR
  // 2. They have already claimed this review
  const customerCanAccessReview = currentUser?.type === 'customer'
    ? (doesReviewMatchUser(review, currentUser) || isClaimedByCurrentUser)
    : true; // Business users can access any review
  
  // Use persistent review access check
  const isReviewActuallyUnlocked = isReviewUnlocked(review.id) || isOneTimeUnlocked;
  
  // For review content: customer users must BOTH have access AND profile match, others just need access
  const canViewFullContent = currentUser?.type === 'customer' 
    ? (isSubscribed || isReviewActuallyUnlocked || isReviewAuthor) && customerCanAccessReview
    : (isSubscribed || isReviewActuallyUnlocked || isReviewAuthor);
  
  // For conversation participation: same rule as content viewing, but also check anonymous restrictions
  const canParticipateInConversationBase = currentUser?.type === 'customer'
    ? (isSubscribed || isReviewActuallyUnlocked || isReviewAuthor) && customerCanAccessReview
    : (isSubscribed || isReviewActuallyUnlocked || isReviewAuthor);

  const canParticipateInConversationFinal = canParticipateInConversationBase && reviewerCanParticipate;

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
    // Don't allow navigation if the review is anonymous
    if (review.is_anonymous) {
      return;
    }

    // If current user is the business owner of this review, go to their own profile
    if (currentUser?.id === review.reviewerId) {
      navigate('/profile');
    } else {
      navigate(`/business-profile/${review.reviewerId}`, {
        state: {
          readOnly: true,
          showRespondButton: currentUser?.type === 'customer',
          reviewId: review.id,
          isAnonymous: review.is_anonymous || false,
          businessCategory: review.reviewerBusinessCategory,
          actualBusinessName: review.reviewerName
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
      componentLogger.info("Creating credit payment session...");
      const { data, error } = await supabase.functions.invoke('create-credit-payment', {
        body: {
          returnUrl: window.location.href // Return to current search page
        }
      });

      if (error) {
        componentLogger.error("Error creating payment session:", error);
        toast.error("Failed to create payment session");
        return;
      }

      if (data?.url) {
        // Navigate to Stripe checkout (works on all platforms including iOS)
        window.location.href = data.url;
      }
    } catch (error) {
      componentLogger.error("Error:", error);
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

  return (
    <Card className="w-full rounded-none border-x-0">
      <CardContent className="py-2 px-1 md:py-4 md:px-2">
        <div className="flex items-start justify-between mb-2 md:mb-3">
          {/* Business info - left side */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              {!review.is_anonymous && <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />}
              <AvatarFallback className={review.is_anonymous ? "bg-purple-100 text-purple-800 text-base md:text-xl" : "bg-blue-100 text-blue-800"}>
                {review.is_anonymous ? "🕵️" : getNameInitials(review.reviewerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <h4
                  className={review.is_anonymous
                    ? "font-medium text-gray-700 text-xs md:text-sm"
                    : "font-medium cursor-pointer hover:text-blue-600 transition-colors text-xs md:text-sm"
                  }
                  onClick={review.is_anonymous ? undefined : handleBusinessNameClick}
                >
                  {displayReviewerName}
                </h4>
                {review.reviewerVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-xs md:text-sm text-gray-500">Business</p>
            </div>
          </div>

          {/* Customer info - desktop (hidden on mobile) */}
          <div className="hidden md:block text-right">
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

        {/* Customer info - mobile only (name top-left, avatar below, contact to right) */}
        <div className="md:hidden mb-2">
          <div className="flex flex-col">
            {/* Customer name at top */}
            <div className="mb-1">
              {customerInfo.isClaimed && canViewFullContent ? (
                <h4
                  className="text-xs font-medium cursor-pointer hover:text-blue-600 transition-colors text-blue-600 hover:underline"
                  onClick={handleCustomerNameClick}
                >
                  {customerInfo.name}
                </h4>
              ) : (
                <h4 className="text-xs font-medium">
                  {customerInfo.name}
                </h4>
              )}
            </div>

            {/* Avatar and contact info side by side */}
            <div className="flex items-start justify-between space-x-2">
              {/* Contact info on the left */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Customer</p>
                {customerInfo.phone && (
                  <p className="text-xs text-gray-500 truncate">{customerInfo.phone}</p>
                )}
                {(customerInfo.address || customerInfo.city) && (
                  <p className="text-xs text-gray-500 truncate">
                    {[customerInfo.address, customerInfo.city, customerInfo.zipCode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {/* Avatar on the right */}
              <Avatar className="h-6 w-6 flex-shrink-0">
                {customerInfo.isClaimed && customerInfo.avatar ? (
                  <AvatarImage src={customerInfo.avatar} alt={customerInfo.name} />
                ) : null}
                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                  {getNameInitials(customerInfo.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Rating and Date */}
        <div className="flex items-center justify-between mb-2 md:mb-3">
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
        <div className="mb-2 md:mb-4">
          {canViewFullContent ? (
            <div>
              <p className={`text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base ${!isExpanded ? 'line-clamp-3' : ''}`}>
                {review.content}
              </p>
              {!isExpanded && review.content.length > 300 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm mt-1 font-medium"
                >
                  see more
                </button>
              )}
              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm mt-1 font-medium"
                >
                  see less
                </button>
              )}
            </div>
          ) : (
            <div className="relative inline-block w-full">
              {/* Clear first 2 characters */}
              <span className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base">
                {review.content.substring(0, 2)}
              </span>
              {/* 3rd letter - halfway between clear and blurry */}
              <span
                className="text-gray-900 leading-relaxed text-xs sm:text-sm md:text-base"
                style={{
                  filter: 'blur(2.5px)',
                  WebkitFilter: 'blur(2.5px)',
                }}
              >
                {review.content.substring(2, 3)}
              </span>
              {/* 4th letter - more blur */}
              <span
                className="text-gray-900 leading-relaxed text-xs sm:text-sm md:text-base"
                style={{
                  filter: 'blur(4px)',
                  WebkitFilter: 'blur(4px)',
                }}
              >
                {review.content.substring(3, 4)}
              </span>
              {/* Fully blurred remaining text */}
              <span
                className="text-gray-900 leading-relaxed text-xs sm:text-sm md:text-base"
                style={{
                  filter: 'blur(5px)',
                  WebkitFilter: 'blur(5px)',
                }}
              >
                {review.content.substring(4)}
              </span>
            </div>
          )}
        </div>

        {/* Review Photos */}
        <BusinessReviewCardPhotos reviewId={review.id} />

        {/* Associate Match Indicator - show when this result came from searching for an associate */}
        {review.isAssociateMatch && review.associateData && (
          <div className="mb-2 md:mb-4 p-2 md:p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
              <span className="text-xs md:text-sm font-medium text-blue-800">
                Found via associate: {`${review.associateData.firstName} ${review.associateData.lastName}`.trim()}
              </span>
            </div>
          </div>
        )}

        {/* Associates and Business Display - split layout (similar to BusinessReviewCard) */}
        {((review.associates && review.associates.length > 0) || review.customer_business_name) && !review.isAssociateMatch && (
          <div className="flex flex-row gap-2 sm:gap-4 mb-2 md:mb-4">
            {/* Associates on the left */}
            {(review.associates && review.associates.length > 0) && (
              <div className="flex-1 min-w-0">
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
              <div className="flex-1 min-w-0">
                <div className="mt-3">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">🏢</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600 mb-2">Business or Employment:</p>
                      <span className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded-md font-medium break-words">
                        🏢 {review.customer_business_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lock/Unlock UI for non-accessible content */}
        {!canViewFullContent && (
          <div className="mb-2 md:mb-4 p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center text-gray-600 mb-2">
              <Lock className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              <span className="text-xs md:text-sm">Full review locked</span>
            </div>
            <p className="text-xs text-gray-500 mb-2 md:mb-3">
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

        {/* Conversation Section */}
        <ReviewConversationSection
          reviewId={review.id}
          shouldShowFullReview={canParticipateInConversationFinal}
          isBusinessUser={currentUser?.type === 'business'}
          isCustomerBeingReviewed={currentUser?.id === review.customerId}
          customerId={review.customerId}
          className="mt-2 md:mt-4"
        />

        {/* Conversation Access Prompt - Show when review content is visible but conversation participation needs unlock */}
        {canViewFullContent && !canParticipateInConversationFinal && (
          <div className="mt-2 md:mt-4 p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center text-gray-600 mb-2">
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              <span className="text-xs md:text-sm">Unlock conversation to participate</span>
            </div>
            <p className="text-xs text-gray-500 mb-2 md:mb-3">
              {!reviewerCanParticipate && isReviewAuthor
                ? "Anonymous reviewers cannot participate in conversations. Edit your review to uncheck the anonymous option to participate."
                : isReviewAuthor
                ? "Even as the review author, you need to unlock or subscribe to participate in conversations"
                : "Subscribe or use credits to participate in the conversation"
              }
            </p>
            {/* Only show unlock/subscribe buttons if user is NOT an anonymous review author */}
            {!(!reviewerCanParticipate && isReviewAuthor) && (
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
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
