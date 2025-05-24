
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Review } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmptyReviewsMessage from "@/components/reviews/EmptyReviewsMessage";
import ReviewPagination from "@/components/reviews/ReviewPagination";
import BusinessReviewCard from "@/components/business/BusinessReviewCard";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BusinessReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, isSubscribed } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [hasSubscription, setHasSubscription] = useState(isSubscribed);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [workingReviews, setWorkingReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add new state for content moderation
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Update local state when subscription changes
  useEffect(() => {
    setHasSubscription(isSubscribed);
  }, [isSubscribed]);
  
  // Fetch reviews from database
  useEffect(() => {
    if (currentUser) {
      fetchBusinessReviews();
    }
  }, [currentUser]);

  const fetchBusinessReviews = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Fetch reviews written by this business
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          created_at,
          customer_id,
          customer_name,
          customer_address,
          customer_city,
          customer_zipcode,
          customer_phone
        `)
        .eq('business_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Format reviews data to match Review type
      const formattedReviews = reviewsData ? reviewsData.map(review => ({
        id: review.id,
        reviewerId: currentUser.id,
        reviewerName: currentUser.name || "Anonymous Business",
        reviewerAvatar: currentUser.avatar,
        customerId: review.customer_id || '',
        customerName: review.customer_name || "Anonymous Customer",
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        address: review.customer_address,
        city: review.customer_city,
        zipCode: review.customer_zipcode,
        reactions: { like: [], funny: [], useful: [], ohNo: [] },
        responses: []
      })) : [];

      setWorkingReviews(formattedReviews);
      
      if (reviewsData && reviewsData.length > 0) {
        toast({
          title: "Reviews Loaded",
          description: `Found ${reviewsData.length} reviews you've written.`,
        });
      }
      
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      toast({
        title: "Error",
        description: "There was an error fetching your reviews. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(workingReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = workingReviews.slice(indexOfFirstReview, indexOfLastReview);

  // Function to handle editing a review
  const handleEditReview = (review: Review) => {
    // Navigate to the NewReview page with the review data
    navigate(`/review/new?edit=true&reviewId=${review.id}&customerId=${review.customerId}`, {
      state: {
        reviewData: review,
        isEditing: true
      }
    });
  };

  // Function to open delete dialog
  const openDeleteDialog = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  // Function to handle deleting a review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewToDelete);

      if (error) {
        throw error;
      }

      setWorkingReviews(prev => prev.filter(review => review.id !== reviewToDelete));
      
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      });
      
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the review. Please try again.",
        variant: "destructive"
      });
    }
    
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  // Handle toggling reactions - with content moderation 
  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    setWorkingReviews(prevReviews => 
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const userId = currentUser?.id || "";
          const hasReacted = review.reactions?.[reactionType]?.includes(userId);
          
          const updatedReactions = { 
            ...review.reactions,
            [reactionType]: hasReacted
              ? review.reactions?.[reactionType].filter(id => id !== userId) || []
              : [...(review.reactions?.[reactionType] || []), userId]
          };
          
          // Show notification toast for the business owner
          if (!hasReacted) {
            toast({
              title: "Reaction added",
              description: `You added a ${reactionType} reaction to your review of ${review.customerName}`,
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Customer Reviews</h1>
                <p className="text-gray-600">
                  Manage the reviews you've written about customers.
                </p>
              </div>
              <Button onClick={fetchBusinessReviews} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh Reviews"}
              </Button>
            </div>
            
            {!hasSubscription ? (
              <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="font-semibold text-yellow-800">Premium Features Disabled</h3>
                    <p className="text-sm text-yellow-700">
                      Your subscription has expired. Subscribe to enable review responses and premium features.
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
                    <h3 className="font-semibold text-green-800">Premium Features Enabled</h3>
                    <p className="text-sm text-green-700">
                      You have full access to all review responses and premium features.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mb-6">
              <div>
                <span className="text-gray-600">
                  {workingReviews.length} {workingReviews.length === 1 ? 'review' : 'reviews'} total
                </span>
              </div>
              <Button asChild>
                <Link to="/review/new">
                  <Edit className="mr-2 h-4 w-4" />
                  Write New Review
                </Link>
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading your reviews...</p>
              </div>
            ) : workingReviews.length === 0 ? (
              <EmptyReviewsMessage type="business" />
            ) : (
              <div className="space-y-6">
                {currentReviews.map((review) => (
                  <BusinessReviewCard
                    key={review.id}
                    review={review}
                    hasSubscription={hasSubscription}
                    onEdit={handleEditReview}
                    onDelete={openDeleteDialog}
                    onReactionToggle={handleReactionToggle}
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

      {/* Add Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
        onClose={() => setShowRejectionDialog(false)}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReview}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BusinessReviews;
