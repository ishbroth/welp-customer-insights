
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

  console.log('🔐 useReviewPermissions: ENTRY PARAMETERS:', {
    isCustomerUser,
    isBusinessUser,
    isCustomerBeingReviewed,
    isReviewAuthor,
    isReviewClaimed,
    hasSubscription,
    isUnlocked,
    hasAccess
  });

  return useMemo(() => {
    // CRITICAL: Can react ONLY if review is ACTUALLY claimed AND user has access
    const canReact = () => {
      const result = isReviewClaimed && hasAccess;
      console.log('🔐 canReact CALCULATION:', {
        isReviewClaimed,
        hasAccess,
        result
      });
      return result;
    };

    // CRITICAL: Can respond ONLY if review is ACTUALLY claimed, user is customer being reviewed, AND has access
    const canRespond = () => {
      const condition1_isReviewClaimed = isReviewClaimed;
      const condition2_isCustomerBeingReviewed = isCustomerBeingReviewed;
      const condition3_hasAccess = hasAccess;
      
      const result = condition1_isReviewClaimed && condition2_isCustomerBeingReviewed && condition3_hasAccess;
      
      console.log('🔐 canRespond CALCULATION:', {
        condition1_isReviewClaimed,
        condition2_isCustomerBeingReviewed,
        condition3_hasAccess,
        all_conditions_met: result
      });
      
      return result;
    };

    // CRITICAL: Customer must pay to see full reviews - no exception for claimed reviews
    const shouldShowFullReview = () => {
      const result = hasAccess;
      console.log('🔐 shouldShowFullReview =', result);
      return result;
    };

    // CRITICAL: Should show claim button ONLY for customers on UNCLAIMED reviews
    const shouldShowClaimButton = () => {
      const result = isCustomerUser && !isReviewClaimed && !isReviewAuthor;
      console.log('🔐 shouldShowClaimButton =', result, {
        isCustomerUser,
        isReviewClaimed_NOT: !isReviewClaimed,
        isReviewAuthor_NOT: !isReviewAuthor
      });
      return result;
    };

    // CRITICAL: Should show respond button ONLY for CLAIMED reviews where customer can respond
    const shouldShowRespondButton = () => {
      const result = canRespond();
      console.log('🔐 shouldShowRespondButton =', result);
      return result;
    };

    const permissions = {
      canReact,
      canRespond,
      shouldShowFullReview,
      shouldShowClaimButton,
      shouldShowRespondButton
    };

    console.log('🔐 FINAL PERMISSIONS:', {
      canReact: canReact(),
      canRespond: canRespond(),
      shouldShowFullReview: shouldShowFullReview(),
      shouldShowClaimButton: shouldShowClaimButton(),
      shouldShowRespondButton: shouldShowRespondButton()
    });

    return permissions;
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
