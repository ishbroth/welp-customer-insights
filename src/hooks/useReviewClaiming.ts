
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

export const useReviewClaiming = () => {
  const [isClaimingReview, setIsClaimingReview] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const claimReview = async (reviewId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to claim this review.",
        variant: "destructive"
      });
      return false;
    }

    setIsClaimingReview(true);

    try {
      console.log('Claiming review:', reviewId, 'for user:', currentUser.id);
      
      // Update the review to link it to the current user
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          customer_id: currentUser.id,
          claimed_at: new Date().toISOString(),
          claimed_by: currentUser.id
        })
        .eq('id', reviewId);

      if (updateError) {
        console.error('Error updating review:', updateError);
        throw updateError;
      }

      // Mark as claimed for this user to prevent showing as new again
      const { error: notificationError } = await supabase
        .from('user_review_notifications')
        .upsert({
          user_id: currentUser.id,
          review_id: reviewId,
          shown_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('Error updating notification:', notificationError);
        // Don't throw here, this is not critical
      }

      toast({
        title: "Review claimed successfully",
        description: "This review has been added to your profile.",
      });

      console.log('Review claimed successfully');
      return true;
    } catch (error) {
      console.error('Error claiming review:', error);
      toast({
        title: "Error claiming review",
        description: "There was an error claiming this review. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsClaimingReview(false);
    }
  };

  return {
    claimReview,
    isClaimingReview
  };
};
