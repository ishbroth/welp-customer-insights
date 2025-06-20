
import { Review } from "@/types";
import { useReviewProfiles } from "@/hooks/useReviewProfiles";
import { useReviewActions } from "@/hooks/useReviewActions";

interface UseEnhancedCustomerReviewCardProps {
  review: Review & {
    customerAvatar?: string;
    matchType?: 'claimed' | 'high_quality' | 'potential';
    matchReasons?: string[];
    matchScore?: number;
    isNewReview?: boolean;
    customer_phone?: string;
  };
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchase: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

export const useEnhancedCustomerReviewCard = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchase,
  onReactionToggle,
}: UseEnhancedCustomerReviewCardProps) => {
  const profileData = useReviewProfiles({ review });
  const actionData = useReviewActions({
    review,
    isUnlocked,
    onPurchase,
    onReactionToggle,
  });

  return {
    ...profileData,
    ...actionData,
  };
};
