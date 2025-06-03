
import { useState } from "react";
import { Review } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BusinessReviewCard from "@/components/business/BusinessReviewCard";
import { Link } from "react-router-dom";

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
    // Navigate to edit page - this would be implemented elsewhere
    console.log('Edit review:', review.id);
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    console.log('Reaction toggle:', reviewId, reactionType);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea384c] mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-gray-500 mb-4">
          You haven't written any customer reviews yet.
        </p>
        <Link to="/new-review">
          <Button className="bg-[#ea384c] hover:bg-[#d63384] text-white">
            Write Your First Review
          </Button>
        </Link>
      </Card>
    );
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
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllReviews(true)}
          >
            Show All {reviews.length} Reviews
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessReviewsList;
