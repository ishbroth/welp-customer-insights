
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Review } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import CustomerReviewCard from "@/components/customer/CustomerReviewCard";
import SubscriptionBanner from "@/components/subscription/SubscriptionBanner";
import EmptyReviewsMessage from "@/components/reviews/EmptyReviewsMessage";
import ReviewPagination from "@/components/reviews/ReviewPagination";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";

const ProfileReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [unlockedReviews, setUnlockedReviews] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // For simulating customer subscription status
  const [hasSubscription, setHasSubscription] = useState(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("subscribed") === "true") {
      setHasSubscription(true);
    }
    
    // Load unlocked reviews from localStorage
    const loadUnlockedReviews = () => {
      const unlocked: string[] = [];
      if (currentUser?.type === "customer") {
        // Get unlocked reviews from localStorage
        const keys = Object.keys(localStorage);
        const reviewAccessKeys = keys.filter(key => key.startsWith('review_access_'));
        
        for (const key of reviewAccessKeys) {
          const isUnlocked = localStorage.getItem(key) === "true";
          if (isUnlocked) {
            const reviewId = key.replace('review_access_', '');
            unlocked.push(reviewId);
          }
        }
      }
      setUnlockedReviews(unlocked);
    };
    
    loadUnlockedReviews();
  }, [currentUser]);
  
  // Add new state for content moderation
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Get reviews about the current customer user - sorted by newest first
  const [customerReviews, setCustomerReviews] = useState<Review[]>(() => {
    // This is a placeholder for actual reviews data
    // In a real app, this would come from the API
    return [];
  });
  
  useEffect(() => {
    // In a real app, we'd fetch reviews from the API
    // For now, just use an empty array if no reviews are available
    if (currentUser?.type === "customer") {
      // Mock implementation until we have real data
      setCustomerReviews([]);
    }
  }, [currentUser]);
  
  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(customerReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = customerReviews.slice(indexOfFirstReview, indexOfLastReview);
  
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
    return unlockedReviews.includes(reviewId) || hasSubscription;
  };

  // Handle toggling reactions - with content moderation for comments if added in the future
  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    setCustomerReviews(prevReviews => 
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const userId = currentUser?.id || "";
          const hasReacted = review.reactions?.[reactionType]?.includes(userId);
          
          const updatedReactions = { 
            ...review.reactions,
            [reactionType]: hasReacted
              ? (review.reactions?.[reactionType] || []).filter(id => id !== userId)
              : [...(review.reactions?.[reactionType] || []), userId]
          };
          
          // Show notification toast for the customer
          if (!hasReacted) {
            toast({
              title: `You reacted with "${reactionType}"`,
              description: `to the review by ${review.reviewerName}`,
            });
          }
          
          return { ...review, reactions: updatedReactions };
        }
        return review;
      })
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
              <p className="text-gray-600">
                See what businesses have said about you. Purchase full access to reviews for $3 each,
                or subscribe for unlimited access.
              </p>
            </div>
            
            {!hasSubscription && <SubscriptionBanner type="customer" />}
            
            {customerReviews.length === 0 ? (
              <EmptyReviewsMessage type="customer" />
            ) : (
              <div className="space-y-6">
                {currentReviews.map((review) => (
                  <CustomerReviewCard
                    key={review.id}
                    review={review}
                    isUnlocked={isReviewUnlocked(review.id)}
                    hasSubscription={hasSubscription}
                    onPurchaseReview={handlePurchaseReview}
                    onReactionToggle={handleReactionToggle}
                  />
                ))}
                
                <ReviewPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
      
      {/* Add Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
      />
    </div>
  );
};

export default ProfileReviews;
