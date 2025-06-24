
interface UseReviewPermissionsProps {
  isCustomerUser: boolean;
  isBusinessUser: boolean;
  isCustomerBeingReviewed: boolean;
  isReviewAuthor: boolean;
  isReviewClaimed: boolean;
  hasSubscription: boolean;
  isUnlocked: boolean;
}

export const useReviewPermissions = ({
  isCustomerUser,
  isBusinessUser,
  isCustomerBeingReviewed,
  isReviewAuthor,
  isReviewClaimed,
  hasSubscription,
  isUnlocked,
}: UseReviewPermissionsProps) => {
  
  const canReact = () => {
    // Can react if review is claimed and user has access, or if user has subscription/unlock
    return isReviewClaimed && (hasSubscription || isUnlocked);
  };

  const canRespond = () => {
    // Can respond if review is claimed and user is the customer being reviewed
    return isReviewClaimed && isCustomerBeingReviewed && (hasSubscription || isUnlocked);
  };

  const shouldShowFullReview = () => {
    // Show full review if claimed and user has access, or if user has subscription/unlock
    return (isReviewClaimed && (hasSubscription || isUnlocked)) || isReviewAuthor;
  };

  const shouldShowClaimButton = () => {
    // Show claim button only if:
    // 1. User is a customer
    // 2. Review is NOT claimed yet
    // 3. User is not the review author (business)
    return isCustomerUser && !isReviewClaimed && !isReviewAuthor;
  };

  const shouldShowRespondButton = () => {
    // Show respond button if review is claimed and user can respond
    return canRespond();
  };

  return {
    canReact,
    canRespond,
    shouldShowFullReview,
    shouldShowClaimButton,
    shouldShowRespondButton,
  };
};
