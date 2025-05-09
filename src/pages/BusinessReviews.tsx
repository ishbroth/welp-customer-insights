
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmptyReviewsMessage from "@/components/reviews/EmptyReviewsMessage";
import ReviewPagination from "@/components/reviews/ReviewPagination";
import ReviewCard from "@/components/ReviewCard";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
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
import { getReviewsByReviewerId, deleteReview } from "@/services/reviewService";
import { ReviewWithCustomer } from "@/types/supabase";

const BusinessReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, isSubscribed } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Set hasSubscription based on auth context
  const [hasSubscription, setHasSubscription] = useState(isSubscribed);
  
  // Update local state when subscription changes
  useEffect(() => {
    setHasSubscription(isSubscribed);
  }, [isSubscribed]);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  
  // State for reviews with empty initial value
  const [workingReviews, setWorkingReviews] = useState<ReviewWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add new state for content moderation
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Load reviews from Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const reviews = await getReviewsByReviewerId(currentUser.id);
        
        // Transform reviews to match our app's expected format
        const transformedReviews = reviews.map((review: any) => ({
          id: review.id,
          reviewer_id: review.reviewer_id,
          customer_id: review.customer_id,
          rating: review.rating,
          content: review.content,
          address: review.address,
          city: review.city,
          state: review.state,
          zip_code: review.zip_code,
          created_at: review.created_at,
          updated_at: review.updated_at,
          customer: review.customer,
          customerName: `${review.customer.first_name} ${review.customer.last_name}`,
          customerId: review.customer_id,
          reviewer_name: currentUser.name,
          date: review.created_at,
          responses: [] // We'll load these separately if needed
        }));
        
        setWorkingReviews(transformedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          title: "Error",
          description: "Failed to load your reviews. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [currentUser, toast]);
  
  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(workingReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = workingReviews.slice(indexOfFirstReview, indexOfLastReview);

  // Function to handle editing a review
  const handleEditReview = (review: ReviewWithCustomer) => {
    // Navigate to the NewReview page with the review data
    navigate(`/review/new?edit=true&reviewId=${review.id}&customerId=${review.customer_id}`, {
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
      await deleteReview(reviewToDelete);
      
      setWorkingReviews(prev => prev.filter(review => review.id !== reviewToDelete));
      
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete your review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  // Handle toggling reactions - with content moderation 
  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    setWorkingReviews(prevReviews => 
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const userId = currentUser?.id || "";
          const reactions = review.reactions || { like: [], funny: [], useful: [], ohNo: [] };
          const hasReacted = reactions[reactionType as keyof typeof reactions]?.includes(userId);
          
          const updatedReactions = { 
            ...reactions,
            [reactionType]: hasReacted
              ? (reactions[reactionType as keyof typeof reactions] || []).filter(id => id !== userId)
              : [...(reactions[reactionType as keyof typeof reactions] || []), userId]
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">My Customer Reviews</h1>
              <p className="text-gray-600">
                Manage the reviews you've written about customers.
              </p>
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
              <div className="text-center py-8">
                <p className="text-gray-500">Loading your reviews...</p>
              </div>
            ) : workingReviews.length === 0 ? (
              <EmptyReviewsMessage type="business" />
            ) : (
              <div className="space-y-6">
                {currentReviews.map((review) => (
                  <div key={review.id} className="relative">
                    <ReviewCard 
                      key={review.id}
                      review={{
                        id: review.id,
                        businessName: review.customerName,
                        businessId: review.customer_id,
                        customerName: currentUser?.name || "",
                        customerId: currentUser?.id,
                        rating: review.rating,
                        comment: review.content,
                        createdAt: review.created_at,
                        location: "",
                        address: review.address || "",
                        city: review.city || "",
                        zipCode: review.zip_code || "00000",
                        responses: review.responses || []
                      }}
                      showResponse={true}
                      hasSubscription={hasSubscription}
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditReview(review)}
                        className="bg-white hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDeleteDialog(review.id)}
                        className="bg-white hover:bg-gray-100 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
