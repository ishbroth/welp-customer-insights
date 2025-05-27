
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";
import CustomerReviewCard from "@/components/customer/CustomerReviewCard";
import EmptyReviewsMessage from "@/components/reviews/EmptyReviewsMessage";
import ReviewPagination from "@/components/reviews/ReviewPagination";

interface ProfileReviewsContentProps {
  customerReviews: Review[];
  isLoading: boolean;
  hasSubscription: boolean;
}

const ProfileReviewsContent = ({ 
  customerReviews, 
  isLoading, 
  hasSubscription 
}: ProfileReviewsContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [localReviews, setLocalReviews] = useState(customerReviews);
  const { currentUser, hasOneTimeAccess } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update local reviews when customerReviews prop changes
  useEffect(() => {
    setLocalReviews(customerReviews);
  }, [customerReviews]);

  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(localReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

  const handlePurchaseReview = (reviewId: string) => {
    // Mock purchase functionality - in a real app, this would initiate a payment flow
    toast({
      title: "Purchase initiated",
      description: "Processing payment for review access...",
      duration: 2000,
    });
    
    // Navigate to the one-time review access page
    navigate(`/one-time-review?customerId=${currentUser?.id}&reviewId=${reviewId}`);
  };

  const isReviewUnlocked = (reviewId: string): boolean => {
    return hasOneTimeAccess(reviewId) || hasSubscription;
  };

  // Handle toggling reactions - with proper state management
  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    const userId = currentUser?.id || '';
    
    setLocalReviews(prevReviews => 
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const currentReactions = review.reactions || { like: [], funny: [], ohNo: [] };
          const hasReacted = currentReactions[reactionType]?.includes(userId);
          
          const updatedReactions = {
            ...currentReactions,
            [reactionType]: hasReacted
              ? currentReactions[reactionType].filter(id => id !== userId)
              : [...(currentReactions[reactionType] || []), userId]
          };
          
          return { ...review, reactions: updatedReactions };
        }
        return review;
      })
    );

    // Show notification toast for the customer
    toast({
      title: `You reacted with "${reactionType}"`,
      description: `to the review`,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-2">Loading your reviews...</p>
        <p className="text-sm text-gray-400">
          We're checking for reviews that match your profile information.
        </p>
      </div>
    );
  }

  if (localReviews.length === 0) {
    return <EmptyReviewsMessage type="customer" />;
  }

  return (
    <div className="space-y-6">
      {localReviews.slice(indexOfFirstReview, indexOfLastReview).map((review) => (
        <CustomerReviewCard
          key={review.id}
          review={review}
          isUnlocked={isReviewUnlocked(review.id)}
          onPurchase={handlePurchaseReview}
          onReactionToggle={handleReactionToggle}
          hasSubscription={hasSubscription}
        />
      ))}
      
      {totalPages > 1 && (
        <ReviewPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ProfileReviewsContent;
