
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
      console.log('Attempting to claim review:', reviewId, 'for user:', currentUser.id);
      
      // CRITICAL: First check if review is already claimed by someone else
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id, customer_id, customer_name')
        .eq('id', reviewId)
        .single();

      if (checkError) {
        console.error('Error checking review status:', checkError);
        throw checkError;
      }

      if (existingReview.customer_id && existingReview.customer_id !== currentUser.id) {
        console.error('Review already claimed by another user:', existingReview.customer_id);
        toast({
          title: "Review already claimed",
          description: "This review has already been claimed by another user.",
          variant: "destructive"
        });
        return false;
      }

      if (existingReview.customer_id === currentUser.id) {
        console.log('Review already claimed by current user');
        toast({
          title: "Already claimed",
          description: "You have already claimed this review.",
        });
        return true;
      }

      // Attempt to claim the review with additional safety check
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          customer_id: currentUser.id,
          claimed_at: new Date().toISOString(),
          claimed_by: currentUser.id
        })
        .eq('id', reviewId)
        .is('customer_id', null); // Only update if still unclaimed

      if (updateError) {
        console.error('Error claiming review:', updateError);
        
        // Check if it's a concurrent claim attempt
        const { data: recheck } = await supabase
          .from('reviews')
          .select('customer_id')
          .eq('id', reviewId)
          .single();

        if (recheck?.customer_id && recheck.customer_id !== currentUser.id) {
          toast({
            title: "Review already claimed",
            description: "This review was just claimed by another user.",
            variant: "destructive"
          });
          return false;
        }
        
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
