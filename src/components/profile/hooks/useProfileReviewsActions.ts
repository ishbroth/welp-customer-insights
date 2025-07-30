
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";
import { useReviewAccess } from "@/hooks/useReviewAccess";
import { supabase } from "@/integrations/supabase/client";

export const useProfileReviewsActions = (
  currentUser: any,
  hasSubscription: boolean,
  hasOneTimeAccess: (reviewId: string) => boolean,
  onRefresh?: () => void
) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isReviewUnlocked: isCreditUnlocked } = useReviewAccess();

  const handlePurchaseReview = async (reviewId: string) => {
    if (!currentUser) {
      sessionStorage.setItem('pendingReviewAccess', JSON.stringify({
        reviewId: reviewId,
        accessType: 'one-time'
      }));
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-credit-payment');
      
      if (error) {
        console.error('Error creating payment session:', error);
        toast({
          title: "Payment Error",
          description: "Failed to initiate payment. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error calling payment function:', error);
      toast({
        title: "Payment Error", 
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isReviewUnlocked = (reviewId: string): boolean => {
    // Only allow access if user has subscription OR has specifically unlocked this review with credits
    const hasAccess = hasSubscription || isCreditUnlocked(reviewId);
    console.log(`🔒 Review ${reviewId} access check:`, { hasSubscription, isCreditUnlocked: isCreditUnlocked(reviewId), hasAccess });
    return hasAccess;
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


  // Handle successful claim with proper data refresh
  const handleClaimSuccess = () => {
    console.log('🎯 Review claimed successfully in useProfileReviewsActions');
    
    // Show success toast
    toast({
      title: "Review claimed successfully",
      description: "This review has been added to your profile.",
    });
    
    // Trigger data refresh
    if (onRefresh) {
      console.log('🎯 Calling onRefresh to trigger data refresh...');
      onRefresh();
    } else {
      console.log('🎯 No onRefresh function provided');
    }
  };

  return {
    handlePurchaseReview,
    handleReactionToggle,
    handleEditReview,
    handleClaimSuccess,
    isReviewUnlocked
  };
};
