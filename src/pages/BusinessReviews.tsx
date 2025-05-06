import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
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

const BusinessReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set hasSubscription to true by default for business users - removing the subscription check
  const [hasSubscription, setHasSubscription] = useState(true);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  
  // State to hold a working copy of reviews (with changes to reactions)
  const [workingReviews, setWorkingReviews] = useState(() => {
    // Initialize working reviews from mock data
    const reviews = [];
    
    if (currentUser?.type === "business") {
      for (const user of mockUsers) {
        if (user.type === "customer" && user.reviews) {
          for (const review of user.reviews) {
            if (review.reviewerId === currentUser.id) {
              reviews.push({
                ...review,
                customerName: user.name,
                customerId: user.id,
                // Ensure reactions exist
                reactions: review.reactions || { like: [], funny: [], useful: [], ohNo: [] },
                // Enhance content if needed
                content: review.content.length < 150 ? 
                  review.content + " We had a very detailed interaction with this customer and would like to highlight several aspects of their behavior that other businesses should be aware of. They were punctual with their payments and communicated clearly throughout our business relationship. We would recommend other businesses to work with this customer based on our positive experience." : 
                  review.content
              });
            }
          }
        }
      }
    }
    
    // Sort reviews by date (newest first)
    return reviews.sort((a, b) => {
      // Convert string dates to Date objects for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
    });
  });

  // Add new state for content moderation
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(workingReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = workingReviews.slice(indexOfFirstReview, indexOfLastReview);

  // Function to handle editing a review
  const handleEditReview = (review) => {
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
  const handleDeleteReview = () => {
    if (!reviewToDelete) return;

    setWorkingReviews(prev => prev.filter(review => review.id !== reviewToDelete));
    
    toast({
      title: "Review deleted",
      description: "Your review has been successfully deleted.",
    });
    
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  // Handle toggling reactions - add content moderation 
  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    setWorkingReviews(prevReviews => 
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const userId = currentUser?.id || "";
          const hasReacted = review.reactions?.[reactionType]?.includes(userId);
          
          const updatedReactions = { 
            ...review.reactions,
            [reactionType]: hasReacted
              ? review.reactions[reactionType].filter(id => id !== userId)
              : [...(review.reactions[reactionType] || []), userId]
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
            
            {workingReviews.length === 0 ? (
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
                        businessId: review.customerId,
                        customerName: currentUser?.name || "",
                        customerId: currentUser?.id,
                        rating: review.rating,
                        comment: review.content,
                        createdAt: review.date,
                        location: "",
                        responses: review.responses
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
