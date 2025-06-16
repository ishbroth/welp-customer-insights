
import { useAuth } from "@/contexts/auth";

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
  // Determine if user can react to this review
  const canReact = () => {
    // Customer users can only react if they've claimed the review about them
    if (isCustomerUser && isCustomerBeingReviewed) {
      return isReviewClaimed;
    }
    
    // Business users can react to any customer review by other businesses
    if (isBusinessUser && !isReviewAuthor) {
      return true;
    }
    
    return false;
  };

  // Determine if user can respond to this review
  const canRespond = () => {
    // Customer users can only respond if they've claimed the review AND have subscription/one-time access
    if (isCustomerUser && isCustomerBeingReviewed && isReviewClaimed) {
      return hasSubscription || isUnlocked;
    }
    
    // Business users can respond if they have subscription/one-time access
    if (isBusinessUser && !isReviewAuthor) {
      return hasSubscription || isUnlocked;
    }
    
    return false;
  };

  // Determine what to show based on user type and subscription status
  const shouldShowFullReview = () => {
    if (isCustomerUser && isCustomerBeingReviewed) {
      // For customer users viewing reviews about them:
      // If they have a subscription, show full review regardless of claim status
      // If they don't have subscription but have claimed + unlocked, show full review
      if (hasSubscription) return true;
      return isReviewClaimed && isUnlocked;
    }
    // For business users or other cases, use the existing isUnlocked logic
    return isUnlocked;
  };

  const shouldShowClaimButton = () => {
    // Show claim button for customer users who haven't claimed the review yet
    return isCustomerUser && isCustomerBeingReviewed && !isReviewClaimed;
  };

  return {
    canReact,
    canRespond,
    shouldShowFullReview,
    shouldShowClaimButton,
  };
};
