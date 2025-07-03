
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
  
  console.log('useReviewPermissions: Permission check:', {
    isCustomerUser,
    isBusinessUser,
    isCustomerBeingReviewed,
    isReviewAuthor,
    isReviewClaimed,
    hasSubscription,
    isUnlocked
  });

  const canReact = () => {
    // Can react if review is claimed and user has access
    const canReactResult = isReviewClaimed && (hasSubscription || isUnlocked);
    console.log('useReviewPermissions: canReact =', canReactResult);
    return canReactResult;
  };

  const canRespond = () => {
    // FIXED: Can respond ONLY if:
    // 1. Review is claimed (has customerId)
    // 2. Current user is the customer being reviewed (claimed the review)
    // 3. user has access (subscription or unlock)
    const canRespondResult = isReviewClaimed && isCustomerBeingReviewed && (hasSubscription || isUnlocked);
    console.log('useReviewPermissions: canRespond =', canRespondResult, {
      isReviewClaimed,
      isCustomerBeingReviewed,
      hasAccess: hasSubscription || isUnlocked
    });
    return canRespondResult;
  };

  const shouldShowFullReview = () => {
    // Show full review if user has access OR if user is the review author
    const shouldShowResult = (hasSubscription || isUnlocked) || isReviewAuthor;
    console.log('useReviewPermissions: shouldShowFullReview =', shouldShowResult);
    return shouldShowResult;
  };

  const shouldShowClaimButton = () => {
    // Show claim button only if:
    // 1. User is a customer
    // 2. Review is NOT claimed yet
    // 3. User is not the review author (business)
    const shouldShowClaimResult = isCustomerUser && !isReviewClaimed && !isReviewAuthor;
    console.log('useReviewPermissions: shouldShowClaimButton =', shouldShowClaimResult);
    return shouldShowClaimResult;
  };

  const shouldShowRespondButton = () => {
    // Show respond button only if user can actually respond
    const shouldShowRespondResult = canRespond();
    console.log('useReviewPermissions: shouldShowRespondButton =', shouldShowRespondResult);
    return shouldShowRespondResult;
  };

  return {
    canReact,
    canRespond,
    shouldShowFullReview,
    shouldShowClaimButton,
    shouldShowRespondButton,
  };
};
