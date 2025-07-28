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
    isReviewUnlocked
  } = useProfileReviewsActions(currentUser, hasSubscription, hasOneTimeAccess, onRefresh);

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
      {isCustomerUser && (
        <ProfileReviewsSections 
          totalMatchedReviews={sortedReviews.length}
        />
      )}

      {sortedReviews.slice(indexOfFirstReview, indexOfLastReview).map((review) => {        
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
