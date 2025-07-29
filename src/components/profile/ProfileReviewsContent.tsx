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
import { useProfileReviewsData } from "./hooks/useProfileReviewsData";
import { useProfileReviewsActions } from "./hooks/useProfileReviewsActions";
import ProfileReviewsSections from "./ProfileReviewsSections";

interface ProfileReviewsContentProps {
  customerReviews: Review[];
  isLoading: boolean;
  hasSubscription: boolean;
  onRefresh?: () => void;
}

const ProfileReviewsContent = ({ 
  customerReviews, 
  isLoading, 
  hasSubscription,
  onRefresh
}: ProfileReviewsContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, hasOneTimeAccess } = useAuth();
  const { markReviewAsShown } = useSessionTracking();

  const { 
    localReviews, 
    claimedReviews, 
    unclaimedReviews, 
    sortedReviews,
    isCustomerUser,
    isBusinessUser
  } = useProfileReviewsData(customerReviews, currentUser);

  const {
    handlePurchaseReview,
    handleReactionToggle,
    handleEditReview,
    handleDeleteReview,
    handleClaimSuccess,
    handlePurchaseSuccess,
    isReviewUnlocked
  } = useProfileReviewsActions(currentUser, hasSubscription, hasOneTimeAccess, onRefresh);

  // Separate permanent reviews from potential matches for customer users
  const permanentReviews = isCustomerUser ? 
    sortedReviews.filter((review: any) => review.isPermanent || review.isClaimed) : [];
  const potentialMatches = isCustomerUser ? 
    sortedReviews.filter((review: any) => !review.isPermanent && !review.isClaimed) : sortedReviews;

  // Mark new reviews as shown
  useEffect(() => {
    customerReviews.forEach(review => {
      const reviewAny = review as any;
      if (reviewAny.isNewReview) {
        markReviewAsShown(review.id);
      }
    });
  }, [customerReviews, markReviewAsShown]);

  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

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
      {isCustomerUser ? (
        <>
          {/* Permanent Reviews Section - Always visible at top */}
          {permanentReviews.length > 0 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Your Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  Reviews you've purchased or responded to ({permanentReviews.length})
                </p>
              </div>
              {permanentReviews.map((review) => (
                <EnhancedCustomerReviewCard
                  key={review.id}
                  review={review as any}
                  isUnlocked={true} // Permanent reviews are always unlocked
                  onPurchase={handlePurchaseReview}
                  onReactionToggle={handleReactionToggle}
                  hasSubscription={hasSubscription}
                />
              ))}
            </div>
          )}

          {/* Potential Matches Section */}
          {potentialMatches.length > 0 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Potential Matches</h3>
                <p className="text-sm text-muted-foreground">
                  Reviews that might be about you ({potentialMatches.length})
                </p>
              </div>
              <ProfileReviewsSections 
                totalMatchedReviews={potentialMatches.length}
              />
              {potentialMatches.slice(indexOfFirstReview, indexOfLastReview).map((review) => (
                <EnhancedCustomerReviewCard
                  key={review.id}
                  review={review as any}
                  isUnlocked={isReviewUnlocked(review.id)}
                  onPurchase={handlePurchaseReview}
                  onReactionToggle={handleReactionToggle}
                  hasSubscription={hasSubscription}
                />
              ))}
            </div>
          )}

          {/* Show empty message only if no reviews at all */}
          {permanentReviews.length === 0 && potentialMatches.length === 0 && (
            <EmptyReviewsMessage type="customer" />
          )}
        </>
      ) : (
        // Business user view - unchanged
        <>
          {sortedReviews.slice(indexOfFirstReview, indexOfLastReview).map((review) => (
            <BusinessReviewCardWrapper
              key={review.id}
              review={review}
              hasSubscription={hasSubscription}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onReactionToggle={handleReactionToggle}
            />
          ))}
        </>
      )}
      
      {/* Pagination only for potential matches section for customers, all reviews for business */}
      {(isCustomerUser ? potentialMatches.length : sortedReviews.length) > reviewsPerPage && (
        <ReviewPagination 
          currentPage={currentPage}
          totalPages={isCustomerUser ? Math.ceil(potentialMatches.length / reviewsPerPage) : totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

// Wrapper component for BusinessReviewCard that uses simplified responses
const BusinessReviewCardWrapper = ({ review, ...props }: any) => {
  const reviewWithBusinessInfo = {
    ...review,
    reviewerId: review.reviewerId || review.business_id,
    reviewerName: review.reviewerName || review.business_profile?.name || 'Business'
  };

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
