
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
  }, []);
  
  // Get reviews about the current customer user
  const [customerReviews, setCustomerReviews] = useState(() => {
    return currentUser?.type === "customer" && currentUser?.reviews 
      ? [...currentUser.reviews].map(review => ({
          ...review,
          responses: review.responses || []
        }))
      : [];
  });
  
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
    
    // Simulate successful purchase after 2 seconds
    setTimeout(() => {
      setUnlockedReviews(prev => [...prev, reviewId]);
      toast({
        title: "Purchase successful!",
        description: "You now have access to the full review.",
        duration: 3000,
      });
    }, 2000);
  };

  const isReviewUnlocked = (reviewId: string): boolean => {
    return unlockedReviews.includes(reviewId) || hasSubscription;
  };

  // Handle toggling reactions
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
                See what businesses have said about you. Purchase full access to reviews for $3 each.
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
    </div>
  );
};

export default ProfileReviews;
