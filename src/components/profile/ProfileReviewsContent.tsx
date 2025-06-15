
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";
import CustomerReviewCard from "@/components/customer/CustomerReviewCard";
import BusinessReviewCard from "@/components/business/BusinessReviewCard";
import EmptyReviewsMessage from "@/components/reviews/EmptyReviewsMessage";
import ReviewPagination from "@/components/reviews/ReviewPagination";
import ClaimableReviewCard from "@/components/customer/ClaimableReviewCard";
import { useSimplifiedResponses } from "@/hooks/useSimplifiedResponses";

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
    console.log("ProfileReviewsContent: Reviews updated", {
      count: customerReviews.length,
      userType: currentUser?.type,
      userId: currentUser?.id
    });
  }, [customerReviews, currentUser]);

  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(localReviews.length / reviewsPerPage);
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

  const handleClaimReview = async (reviewId: string) => {
    // Refresh the reviews list after claiming
    window.location.reload(); // Simple refresh for now
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

  if (localReviews.length === 0) {
    return <EmptyReviewsMessage type={currentUser?.type === "customer" ? "customer" : "business"} />;
  }

  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
  const isCustomerUser = currentUser?.type === "customer";

  return (
    <div className="space-y-6">
      {localReviews.slice(indexOfFirstReview, indexOfLastReview).map((review) => {
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
          // For customer users, show different components based on claim status
          const reviewAny = review as any;
          
          if (reviewAny.isClaimed === false && (reviewAny.matchType === 'high_quality' || reviewAny.matchType === 'potential')) {
            // Show claimable review card for unclaimed potential matches
            return (
              <ClaimableReviewCard
                key={review.id}
                review={review}
                matchReasons={reviewAny.matchReasons || []}
                matchScore={reviewAny.matchScore || 0}
                onClaim={handleClaimReview}
                isUnlocked={isReviewUnlocked(review.id)}
                hasSubscription={hasSubscription}
              />
            );
          } else {
            // Show normal customer review card for claimed reviews
            return (
              <CustomerReviewCardWrapper
                key={review.id}
                review={review}
                isUnlocked={isReviewUnlocked(review.id)}
                onPurchase={handlePurchaseReview}
                onReactionToggle={handleReactionToggle}
                hasSubscription={hasSubscription}
              />
            );
          }
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

// Wrapper component for CustomerReviewCard that uses simplified responses
const CustomerReviewCardWrapper = ({ review, ...props }: any) => {
  const customerData = {
    firstName: review.customerName?.split(' ')[0] || '',
    lastName: review.customerName?.split(' ').slice(1).join(' ') || '',
    phone: review.customer_phone,
    address: review.customer_address,
    city: review.customer_city,
    zipCode: review.customer_zipcode
  };

  // Make sure we pass the review with proper business name
  const reviewWithBusinessInfo = {
    ...review,
    reviewerId: review.reviewerId || review.business_id,
    reviewerName: review.reviewerName || review.business_profile?.name || 'Business'
  };

  console.log('CustomerReviewCardWrapper: Review info:', {
    reviewId: review.id,
    reviewerId: reviewWithBusinessInfo.reviewerId,
    reviewerName: reviewWithBusinessInfo.reviewerName,
    customerData
  });

  const { data: simplifiedResponses } = useSimplifiedResponses(reviewWithBusinessInfo, customerData);
  
  return (
    <CustomerReviewCard
      {...props}
      review={{
        ...review,
        responses: simplifiedResponses || []
      }}
    />
  );
};

export default ProfileReviewsContent;
