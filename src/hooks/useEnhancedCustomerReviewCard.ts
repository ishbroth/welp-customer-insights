
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import { useReviewProfiles } from "@/hooks/useReviewProfiles";
import { useReviewReactions } from "@/hooks/useReviewReactions";
import { useReviewNavigation } from "@/hooks/useReviewNavigation";

interface UseEnhancedCustomerReviewCardProps {
  review: Review & {
    customerAvatar?: string;
    matchType?: 'high_quality' | 'potential';
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
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // User type and permission checks
  const isReviewAuthor = currentUser?.id === review.reviewerId;
  const isCustomerBeingReviewed = currentUser?.id === review.customerId;
  const isBusinessUser = currentUser?.type === "business";
  const isCustomerUser = currentUser?.type === "customer";

  const profileData = useReviewProfiles({ review });

  const reactionData = useReviewReactions({
    reviewId: review.id,
    initialReactions: review.reactions || { like: [], funny: [], ohNo: [] },
    onReactionToggle,
  });

  const navigationData = useReviewNavigation({
    reviewerId: review.reviewerId,
    isUnlocked,
  });

  const handlePurchaseClick = () => {
    if (!currentUser) {
      sessionStorage.setItem('pendingReviewAccess', JSON.stringify({
        reviewId: review.id,
        accessType: 'one-time'
      }));
      navigate('/login');
      return;
    }
    onPurchase(review.id);
  };

  return {
    ...profileData,
    reactions: reactionData.reactions,
    handleReactionToggle: reactionData.handleReactionToggle,
    handleBusinessNameClick: navigationData.handleBusinessNameClick,
    handlePurchaseClick,
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
  };
};
