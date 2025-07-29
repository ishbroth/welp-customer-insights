
import { useState } from "react";
import { Review } from "@/types";
import BusinessReviewCard from "@/components/business/BusinessReviewCard";
import BusinessReviewsLoadingState from "@/components/business/BusinessReviewsLoadingState";
import BusinessReviewsEmptyState from "@/components/business/BusinessReviewsEmptyState";
import BusinessReviewsShowAllButton from "@/components/business/BusinessReviewsShowAllButton";

interface BusinessReviewsListProps {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  hasSubscription: boolean;
  isLoading: boolean;
  onDeleteReview: (reviewId: string) => void;
}

const BusinessReviewsList = ({ 
  reviews, 
  hasSubscription, 
  isLoading,
  onDeleteReview 
}: BusinessReviewsListProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const handleEditReview = (review: Review) => {
    // The edit functionality is now handled directly in BusinessReviewCard
    // This function is no longer needed as each card handles its own edit
    console.log('Edit review handled by BusinessReviewCard:', review.id);
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    console.log('Reaction toggle:', reviewId, reactionType);
  };

  if (isLoading) {
    return <BusinessReviewsLoadingState />;
  }

  if (reviews.length === 0) {
    return <BusinessReviewsEmptyState />;
  }

  return (
    <div className="space-y-6">
      {displayedReviews.map((review) => (
        <BusinessReviewCard
          key={review.id}
          review={review}
          hasSubscription={hasSubscription}
          onEdit={handleEditReview}
          onDelete={onDeleteReview}
          onReactionToggle={handleReactionToggle}
        />
      ))}
      
      {reviews.length > 3 && !showAllReviews && (
        <BusinessReviewsShowAllButton 
          totalReviews={reviews.length}
          onShowAll={() => setShowAllReviews(true)}
        />
      )}
    </div>
  );
};

export default BusinessReviewsList;
