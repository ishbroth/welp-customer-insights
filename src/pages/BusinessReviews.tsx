
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { supabase, checkSubscriptionStatus } from "@/lib/supabase";

const BusinessReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, isSubscribed } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Set hasSubscription based on auth context
  const [hasSubscription, setHasSubscription] = useState(isSubscribed);
  
  // Check subscription status from Supabase
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['subscriptionStatus', currentUser?.id],
    queryFn: () => currentUser ? checkSubscriptionStatus(currentUser.id) : false,
    enabled: !!currentUser,
    onSuccess: (data) => {
      setHasSubscription(!!data);
    }
  });
  
  // Update local state when subscription changes
  useEffect(() => {
    setHasSubscription(isSubscribed || !!subscriptionStatus);
  }, [isSubscribed, subscriptionStatus]);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Fetch business reviews from Supabase
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['businessReviews', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customer: customer_id (
            id,
            name,
            first_name,
            last_name,
            address,
            city,
            state,
            zipcode
          ),
          responses (
            *,
            profile: profiles (
              id, 
              name
            )
          )
        `)
        .eq('business_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!currentUser?.id
  });
  
  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      // First delete all responses associated with the review
      const { error: responsesError } = await supabase
        .from('responses')
        .delete()
        .eq('review_id', reviewId);
        
      if (responsesError) {
        throw responsesError;
      }
      
      // Then delete the review itself
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
        
      if (error) {
        throw error;
      }
      
      return reviewId;
    },
    onSuccess: () => {
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      });
      
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['businessReviews'] });
      
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil((reviews?.length || 0) / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews ? reviews.slice(indexOfFirstReview, indexOfLastReview) : [];

  // Function to handle editing a review
  const handleEditReview = (review: any) => {
    // Navigate to the NewReview page with the review data
    navigate(`/review/new?edit=true&reviewId=${review.id}&customerId=${review.customer_id}`, {
      state: {
        reviewData: {
          id: review.id,
          content: review.content,
          rating: review.rating,
          customerId: review.customer_id,
          customerName: review.customer?.name || `${review.customer?.first_name || ""} ${review.customer?.last_name || ""}`,
          zipCode: review.customer?.zipcode
        },
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
    if (reviewToDelete) {
      deleteReviewMutation.mutate(reviewToDelete);
    }
  };

  const handleSubscribeClick = () => {
    navigate('/subscription');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex flex-col md:flex-row">
          <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-6">
            <div className="container mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">My Customer Reviews</h1>
              </div>
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-welp-primary"></div>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

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
                  {reviews?.length || 0} {(reviews?.length || 0) === 1 ? 'review' : 'reviews'} total
                </span>
              </div>
              <Button asChild>
                <Link to="/review/new">
                  <Edit className="mr-2 h-4 w-4" />
                  Write New Review
                </Link>
              </Button>
            </div>
            
            {!reviews?.length ? (
              <EmptyReviewsMessage type="business" />
            ) : (
              <div className="space-y-6">
                {currentReviews.map((review) => (
                  <div key={review.id} className="relative">
                    <ReviewCard 
                      key={review.id}
                      review={{
                        id: review.id,
                        businessName: review.customer?.name || `${review.customer?.first_name || ""} ${review.customer?.last_name || ""}`,
                        businessId: review.customer_id,
                        customerName: currentUser?.name || "",
                        customerId: currentUser?.id,
                        rating: review.rating,
                        comment: review.content,
                        createdAt: review.created_at,
                        location: "",
                        address: review.customer?.address || "",
                        city: review.customer?.city || "",
                        zipCode: review.customer?.zipcode || "",
                        responses: review.responses?.map((resp: any) => ({
                          id: resp.id,
                          authorId: resp.profile?.id || "",
                          authorName: resp.profile?.name || "Unknown",
                          content: resp.content,
                          createdAt: resp.created_at
                        })) || []
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

      {/* Content Rejection Dialog */}
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
