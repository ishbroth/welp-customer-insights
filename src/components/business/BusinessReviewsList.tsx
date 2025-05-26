
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";
import EmptyReviewsMessage from "@/components/reviews/EmptyReviewsMessage";
import ReviewPagination from "@/components/reviews/ReviewPagination";
import BusinessReviewCard from "@/components/business/BusinessReviewCard";
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

interface BusinessReviewsListProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  hasSubscription: boolean;
  isLoading: boolean;
  onDeleteReview: (reviewId: string) => Promise<void>;
}

const BusinessReviewsList = ({ 
  reviews, 
  setReviews, 
  hasSubscription, 
  isLoading, 
  onDeleteReview 
}: BusinessReviewsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Function to handle editing a review
  const handleEditReview = (review: Review) => {
    console.log("Editing review with data:", review);
    
    // Create a proper review data object with all necessary fields from the database
    const reviewDataForEdit = {
      id: review.id,
      rating: review.rating,
      content: review.content,
      customerName: review.customerName,
      // Map the review fields correctly - these come from the database
      address: review.address || "",
      city: review.city || "",
      zipCode: review.zipCode || "",
      // Get phone from the custom field we stored
      phone: (review as any).phone || ""
    };
    
    console.log("Passing review data to edit form:", reviewDataForEdit);
    
    // Navigate to the NewReview page with the review data
    navigate(`/review/new?edit=true&reviewId=${review.id}&customerId=${review.customerId}`, {
      state: {
        reviewData: reviewDataForEdit,
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
    await onDeleteReview(reviewToDelete);
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  // Handle toggling reactions - with content moderation 
  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    setReviews(prevReviews => 
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

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading your reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return <EmptyReviewsMessage type="business" />;
  }

  return (
    <>
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
    </>
  );
};

export default BusinessReviewsList;
