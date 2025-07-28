
import { useMemo } from 'react';

interface UseReviewPermissionsProps {
  isCustomerUser: boolean;
  isBusinessUser: boolean;
  isCustomerBeingReviewed: boolean;
  isReviewAuthor: boolean;
  hasSubscription: boolean;
  isUnlocked: boolean;
}

export const useReviewPermissions = ({
  isCustomerUser,
  isBusinessUser,
  isCustomerBeingReviewed,
  isReviewAuthor,
  hasSubscription,
  isUnlocked
}: UseReviewPermissionsProps) => {
  
  const hasAccess = hasSubscription || isUnlocked;

  return useMemo(() => {
    // Can react if user has access (subscription or unlocked)
    const canReact = () => {
      return hasAccess;
    };

    // Can respond if user is customer being reviewed AND has access
    const canRespond = () => {
      return isCustomerBeingReviewed && hasAccess;
    };

    // Show full review if user has access
    const shouldShowFullReview = () => {
      return hasAccess;
    };

    // Show respond button if customer can respond
    const shouldShowRespondButton = () => {
      return canRespond();
    };

    const permissions = {
      canReact,
      canRespond,
      shouldShowFullReview,
      shouldShowRespondButton
    };

    return permissions;
  }, [
    isCustomerUser,
    isBusinessUser,
    isCustomerBeingReviewed,
    isReviewAuthor,
    hasSubscription,
    isUnlocked,
    hasAccess
  ]);
};
