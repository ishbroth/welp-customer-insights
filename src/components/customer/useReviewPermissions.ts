
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
  
  console.log('useReviewPermissions: ENTRY PARAMETERS:', {
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
    console.log('useReviewPermissions: canReact CALCULATION:', {
      isReviewClaimed,
      hasAccess: hasSubscription || isUnlocked,
      result: canReactResult
    });
    return canReactResult;
  };

  const canRespond = () => {
    // CRITICAL: Can respond ONLY if ALL THREE conditions are met:
    // 1. Review is claimed (has customerId in database)
    // 2. Current user is the customer being reviewed (claimed the review)
    // 3. User has access (subscription or unlock)
    const canRespondResult = isReviewClaimed && isCustomerBeingReviewed && (hasSubscription || isUnlocked);
    console.log('useReviewPermissions: canRespond CALCULATION:', {
      condition1_isReviewClaimed: isReviewClaimed,
      condition2_isCustomerBeingReviewed: isCustomerBeingReviewed, 
      condition3_hasAccess: hasSubscription || isUnlocked,
      all_conditions_met: canRespondResult,
      breakdown: {
        isReviewClaimed,
        isCustomerBeingReviewed,
        hasSubscription,
        isUnlocked
      }
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
    // CRITICAL: Show claim button ONLY if:
    // 1. User is a customer
    // 2. Review is NOT claimed yet
    // 3. User is not the review author (business)
    const shouldShowClaimResult = isCustomerUser && !isReviewClaimed && !isReviewAuthor;
    console.log('useReviewPermissions: shouldShowClaimButton CALCULATION:', {
      condition1_isCustomerUser: isCustomerUser,
      condition2_reviewNotClaimed: !isReviewClaimed,
      condition3_notReviewAuthor: !isReviewAuthor,
      all_conditions_met: shouldShowClaimResult,
      breakdown: {
        isCustomerUser,
        isReviewClaimed,
        isReviewAuthor
      }
    });
    return shouldShowClaimResult;
  };

  const shouldShowRespondButton = () => {
    // CRITICAL: Show respond button ONLY if user can actually respond
    // This means ALL conditions in canRespond() must be true
    const shouldShowRespondResult = canRespond();
    console.log('useReviewPermissions: shouldShowRespondButton CALCULATION:', {
      result: shouldShowRespondResult,
      same_as_canRespond: shouldShowRespondResult
    });
    return shouldShowRespondResult;
  };

  const finalResults = {
    canReact: canReact(),
    canRespond: canRespond(),
    shouldShowFullReview: shouldShowFullReview(),
    shouldShowClaimButton: shouldShowClaimButton(),
    shouldShowRespondButton: shouldShowRespondButton(),
  };

  console.log('useReviewPermissions: FINAL RESULTS:', finalResults);

  return {
    canReact,
    canRespond,
    shouldShowFullReview,
    shouldShowClaimButton,
    shouldShowRespondButton,
  };
};
