import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";
import BusinessReviewCard from "@/components/business/BusinessReviewCard";
import EmptyReviewsMessage from "@/components/reviews/EmptyReviewsMessage";
import ReviewPagination from "@/components/reviews/ReviewPagination";
import EnhancedCustomerReviewCard from "@/components/customer/EnhancedCustomerReviewCard";
import { useSimplifiedResponses } from "@/hooks/useSimplifiedResponses";
import { useSessionTracking } from "@/hooks/useSessionTracking";

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
  const { markReviewAsShown } = useSessionTracking();

  // Update local reviews when customerReviews prop changes
  useEffect(() => {
    setLocalReviews(customerReviews);
    console.log("ProfileReviewsContent: Reviews updated", {
      count: customerReviews.length,
      userType: currentUser?.type,
      userId: currentUser?.id,
      reviewsWithClaimStatus: customerReviews.map(r => ({
        id: r.id,
        matchType: (r as any).matchType,
        customerId: r.customerId,
        claimed: r.customerId === currentUser?.id
      }))
    });

    // Mark new reviews as shown
    customerReviews.forEach(review => {
      const reviewAny = review as any;
      if (reviewAny.isNewReview) {
        markReviewAsShown(review.id);
      }
    });
  }, [customerReviews, currentUser, markReviewAsShown]);

  // Pagination settings
  const reviewsPerPage = 5;
  
  // For customer users, separate claimed vs unclaimed reviews
  const isCustomerUser = currentUser?.type === "customer";
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
  
  let claimedReviews: any[] = [];
  let unclaimedReviews: any[] = [];
  let sortedReviews: any[] = [];

  if (isCustomerUser) {
    // Separate reviews by ACTUAL claim status from database
    claimedReviews = localReviews.filter(review => {
      const isActuallyClaimed = review.customerId === currentUser?.id;
      console.log('Review claim check:', {
        reviewId: review.id,
        reviewCustomerId: review.customerId,
        currentUserId: currentUser?.id,
        isActuallyClaimed,
        matchType: (review as any).matchType
      });
      return isActuallyClaimed;
    });

    unclaimedReviews = localReviews.filter(review => {
      const isActuallyClaimed = review.customerId === currentUser?.id;
      return !isActuallyClaimed;
    });

    console.log('Review categorization:', {
      totalReviews: localReviews.length,
      claimedCount: claimedReviews.length,
      unclaimedCount: unclaimedReviews.length
    });

    // Sort unclaimed reviews by match quality first, then claimed reviews
    const sortedUnclaimed = unclaimedReviews.sort((a, b) => {
      const aData = a as any;
      const bData = b as any;
      
      // New reviews first
      if (aData.isNewReview && !bData.isNewReview) return -1;
      if (!aData.isNewReview && bData.isNewReview) return 1;
      
      // Then by match quality
      if (aData.matchType === 'high_quality' && bData.matchType === 'potential') return -1;
      if (aData.matchType === 'potential' && bData.matchType === 'high_quality') return 1;
      
      // Finally by match score, then date
      if (aData.matchScore !== bData.matchScore) return (bData.matchScore || 0) - (aData.matchScore || 0);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const sortedClaimed = claimedReviews.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Show unclaimed first, then claimed
    sortedReviews = [...sortedUnclaimed, ...sortedClaimed];
  } else {
    // For business users, use original sorting
    sortedReviews = [...localReviews].sort((a, b) => {
      const aData = a as any;
      const bData = b as any;
      
      // New reviews first
      if (aData.isNewReview && !bData.isNewReview) return -1;
      if (!aData.isNewReview && bData.isNewReview) return 1;
      
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

  const handlePurchaseReview = (reviewId: string) => {
    toast({
      title: "Purchase initiated",
      description: "Processing payment for review access...",
      duration: 2000,
    });
    
    navigate(`/one-time-review?customerId=${currentUser?.id}&reviewId=${reviewId}`);
  };

  const isReviewUnlocked = (reviewId: string): boolean => {
    return hasOneTimeAccess(reviewId) || hasSubscription;
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    toast({
      title: `You reacted with "${reactionType}"`,
      description: `to the review`,
    });
  };

  const handleEditReview = (review: Review) => {
    navigate(`/edit-review/${review.id}`);
  };

  const handleDeleteReview = (reviewId: string) => {
    console.log('Delete review:', reviewId);
  };

  // Handle successful claim - refresh the page to show updated status
  const handleClaimSuccess = () => {
    // Force a page refresh to reload the reviews with updated claim status
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea384c] mx-auto mb-4"></div>
        <p className="text-gray-500 mb-2">Loading your reviews...</p>
        <p className="text-sm text-gray-400">
          {currentUser?.type === "customer" 
            ? "Searching for reviews written about you by businesses..."
            : "We're checking for reviews that match your profile information."
          }
        </p>
      </div>
    );
  }

  if (sortedReviews.length === 0) {
    return <EmptyReviewsMessage type={currentUser?.type === "customer" ? "customer" : "business"} />;
  }

  return (
    <div className="space-y-6">
      {/* Show section headers for customer users */}
      {isCustomerUser && (
        <div className="space-y-6">
          {/* Unclaimed Reviews Section */}
          {unclaimedReviews.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Potential Review Matches ({unclaimedReviews.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These reviews appear to be about you based on matching information. Click "Claim this Review" to link them to your profile.
              </p>
            </div>
          )}
          
          {/* Claimed Reviews Section */}
          {claimedReviews.length > 0 && unclaimedReviews.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Your Claimed Reviews ({claimedReviews.length})
              </h3>
            </div>
          )}
        </div>
      )}

      {sortedReviews.slice(indexOfFirstReview, indexOfLastReview).map((review, index) => {        
        if (isBusinessUser) {
          return (
            <BusinessReviewCardWrapper
              key={review.id}
              review={review}
              hasSubscription={hasSubscription}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onReactionToggle={handleReactionToggle}
            />
          );
        } else if (isCustomerUser) {
          return (
            <EnhancedCustomerReviewCard
              key={review.id}
              review={review as any}
              isUnlocked={isReviewUnlocked(review.id)}
              onPurchase={handlePurchaseReview}
              onReactionToggle={handleReactionToggle}
              hasSubscription={hasSubscription}
              onClaimSuccess={handleClaimSuccess}
            />
          );
        }
        
        return null;
      })}
      
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

// Wrapper component for BusinessReviewCard that uses simplified responses
const BusinessReviewCardWrapper = ({ review, ...props }: any) => {
  // Make sure we pass the review with proper business name
  const reviewWithBusinessInfo = {
    ...review,
    reviewerId: review.reviewerId || review.business_id,
    reviewerName: review.reviewerName || review.business_profile?.name || 'Business'
  };

  console.log('BusinessReviewCardWrapper: Review info:', {
    reviewId: review.id,
    reviewerId: reviewWithBusinessInfo.reviewerId,
    reviewerName: reviewWithBusinessInfo.reviewerName
  });

  const { data: simplifiedResponses } = useSimplifiedResponses(reviewWithBusinessInfo);
  
  return (
    <BusinessReviewCard
      {...props}
      review={{
        ...review,
        responses: simplifiedResponses || []
      }}
    />
  );
};

export default ProfileReviewsContent;
