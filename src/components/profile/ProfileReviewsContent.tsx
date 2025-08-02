import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";
import BusinessReviewCard from "@/components/business/BusinessReviewCard";
import EmptyReviewsMessage from "@/components/reviews/EmptyReviewsMessage";
import ReviewPagination from "@/components/reviews/ReviewPagination";
import EnhancedCustomerReviewCard from "@/components/customer/EnhancedCustomerReviewCard";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useBusinessReviews } from "@/hooks/useBusinessReviews";
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
  const { deleteReview } = useBusinessReviews(onRefresh);

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
        <WelpLoadingIcon 
          size={80} 
          showText={true} 
          text={currentUser?.type === "customer" 
            ? "Searching for reviews written about you by businesses..."
            : "Loading your reviews..."
          }
          className="mb-4"
        />
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
              onDelete={deleteReview}
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

// Wrapper component for BusinessReviewCard
const BusinessReviewCardWrapper = ({ review, ...props }: any) => {
  return (
    <BusinessReviewCard
      {...props}
      review={review}
    />
  );
};

export default ProfileReviewsContent;
