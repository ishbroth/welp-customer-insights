
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Review } from "@/types";
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
import { Button } from "@/components/ui/button";

const ProfileReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, isSubscribed, hasOneTimeAccess } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Set local subscription status based on auth context
  const [hasSubscription, setHasSubscription] = useState(isSubscribed);
  
  // State for customer reviews
  const [customerReviews, setCustomerReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Update local subscription status when the auth context changes
    setHasSubscription(isSubscribed);
    
    // Check URL params for legacy support
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("subscribed") === "true") {
      setHasSubscription(true);
    }
  }, [currentUser, isSubscribed]);
  
  // Add new state for content moderation
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Automatically fetch reviews based on customer profile info when component mounts
  useEffect(() => {
    if (currentUser && currentUser.type === "customer") {
      fetchCustomerReviews();
    }
  }, [currentUser]);
  
  // Function to fetch customer reviews based on profile information
  const fetchCustomerReviews = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, this would make an API call to fetch reviews
      // We're simulating the API call with a timeout
      setTimeout(() => {
        // For demo purposes, we're just creating empty reviews array
        // In a real implementation, this would use the customer's name, address, etc.
        // to search for matching reviews in the database
        
        // Example of how we would use profile info to search:
        // const searchParams = {
        //   firstName: currentUser.name.split(' ')[0],
        //   lastName: currentUser.name.split(' ').slice(1).join(' '),
        //   phone: currentUser.phone || '',
        //   address: currentUser.address || '',
        //   city: currentUser.city || '',
        //   state: currentUser.state || '',
        //   zipCode: currentUser.zipCode || ''
        // };
        
        // For now, we'll just set empty array since we're not actually fetching from a database
        setCustomerReviews([]);
        
        // Show a toast to inform the user what's happening
        toast({
          title: "Reviews Loaded",
          description: "We've checked for reviews that match your profile information.",
        });
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      toast({
        title: "Error",
        description: "There was an error fetching your reviews. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
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
    return hasOneTimeAccess(reviewId) || hasSubscription;
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

  const handleSubscribeClick = () => {
    navigate('/subscription');
  };

  // Function to manually refresh reviews
  const handleRefreshReviews = () => {
    fetchCustomerReviews();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
                <p className="text-gray-600">
                  See what businesses have said about you. Purchase full access to reviews for $3 each,
                  or subscribe for unlimited access.
                </p>
              </div>
              <Button onClick={handleRefreshReviews} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh Reviews"}
              </Button>
            </div>
            
            {!hasSubscription ? (
              <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="font-semibold text-yellow-800">Premium Features Disabled</h3>
                    <p className="text-sm text-yellow-700">
                      Subscribe now to unlock full access to all reviews and responses.
                    </p>
                  </div>
                  <Button onClick={handleSubscribeClick} className="bg-yellow-600 hover:bg-yellow-700">
                    Subscribe Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 border border-green-300 bg-green-50 rounded-md">
                <div className="flex items-center">
                  <div>
                    <h3 className="font-semibold text-green-800">Premium Subscription Active</h3>
                    <p className="text-sm text-green-700">
                      You have full access to all reviews and response features.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-2">Loading your reviews...</p>
                <p className="text-sm text-gray-400">
                  We're checking for reviews that match your profile information.
                </p>
              </div>
            ) : customerReviews.length === 0 ? (
              <EmptyReviewsMessage type="customer" />
            ) : (
              <div className="space-y-6">
                {currentReviews.map((review) => (
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
            )}
          </div>
        </main>
      </div>
      <Footer />
      
      {showRejectionDialog && rejectionReason && (
        <ContentRejectionDialog
          reason={rejectionReason}
          onClose={() => setShowRejectionDialog(false)}
        />
      )}
    </div>
  );
};

export default ProfileReviews;
