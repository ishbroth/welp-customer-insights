
import { useMemo } from 'react';

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
  isUnlocked
}: UseReviewPermissionsProps) => {
  
  const hasAccess = hasSubscription || isUnlocked;

  console.log('useReviewPermissions: ENTRY PARAMETERS:', {
    isCustomerUser,
    isBusinessUser,
    isCustomerBeingReviewed,
    isReviewAuthor,
    isReviewClaimed,
    hasSubscription,
    isUnlocked
  });

  return useMemo(() => {
    // Can react: only if review is claimed AND user has access
    const canReact = () => {
      const result = isReviewClaimed && hasAccess;
      console.log('useReviewPermissions: canReact CALCULATION:', {
        isReviewClaimed,
        hasAccess,
        result
      });
      return result;
    };

    // Can respond: ONLY if review is claimed, user is customer being reviewed, AND has access
    const canRespond = () => {
      const condition1_isReviewClaimed = isReviewClaimed;
      const condition2_isCustomerBeingReviewed = isCustomerBeingReviewed;
      const condition3_hasAccess = hasAccess;
      
      const result = condition1_isReviewClaimed && condition2_isCustomerBeingReviewed && condition3_hasAccess;
      
      console.log('useReviewPermissions: canRespond CALCULATION:', {
        condition1_isReviewClaimed,
        condition2_isCustomerBeingReviewed,
        condition3_hasAccess,
        all_conditions_met: result,
        breakdown: {
          isReviewClaimed,
          isCustomerBeingReviewed,
          hasSubscription,
          isUnlocked
        }
      });
      
      return result;
    };

    // Should show full review: if has access OR review is claimed by current user
    const shouldShowFullReview = () => {
      const result = hasAccess || (isCustomerUser && isReviewClaimed && isCustomerBeingReviewed);
      console.log('useReviewPermissions: shouldShowFullReview =', result);
      return result;
    };

    // Should show claim button: for customers on unclaimed reviews
    const shouldShowClaimButton = () => {
      const result = isCustomerUser && !isReviewClaimed && !isReviewAuthor;
      console.log('useReviewPermissions: shouldShowClaimButton =', result);
      return result;
    };

    // Should show respond button: ONLY for claimed reviews where customer can respond
    const shouldShowRespondButton = () => {
      const result = canRespond();
      console.log('useReviewPermissions: shouldShowRespondButton =', result);
      return result;
    };

    return {
      canReact,
      canRespond,
      shouldShowFullReview,
      shouldShowClaimButton,
      shouldShowRespondButton
    };
  }, [
    isCustomerUser,
    isBusinessUser,
    isCustomerBeingReviewed,
    isReviewAuthor,
    isReviewClaimed,
    hasSubscription,
    isUnlocked,
    hasAccess
  ]);
};
