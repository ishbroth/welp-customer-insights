import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReviewClaims = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Claim a review atomically
  const claimReview = async (
    reviewId: string,
    claimType: 'credit_unlock' | 'subscription_response' | 'direct_claim',
    creditTransactionId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('User not authenticated');
      }

      // Call the atomic claim function
      const { data, error } = await supabase.rpc('claim_review', {
        p_review_id: reviewId,
        p_claimed_by: currentUser.user.id,
        p_claim_type: claimType,
        p_credit_transaction_id: creditTransactionId
      });

      if (error) {
        console.error('Error claiming review:', error);
        if (error.message.includes('unique_violation')) {
          toast({
            title: "Review Already Claimed",
            description: "This review has already been claimed by another user.",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      if (!data) {
        toast({
          title: "Review Already Claimed",
          description: "This review has already been claimed by another user.",
          variant: "destructive",
        });
        return false;
      }

      console.log(`✅ Successfully claimed review ${reviewId} with type ${claimType}`);
      return true;
    } catch (error) {
      console.error('Error in claimReview:', error);
      toast({
        title: "Error",
        description: "Failed to claim review. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get reviews claimed by current user
  const getUserClaimedReviews = async (): Promise<any[]> => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return [];

      const { data: claims, error } = await supabase
        .from('review_claims')
        .select(`
          review_id,
          claim_type,
          claimed_at,
          reviews (
            id,
            business_id,
            rating,
            content,
            created_at,
            customer_name,
            customer_phone,
            customer_address,
            customer_city,
            customer_zipcode,
            profiles!business_id(id, name, avatar, verified)
          )
        `)
        .eq('claimed_by', currentUser.user.id)
        .order('claimed_at', { ascending: false });

      if (error) {
        console.error('Error fetching user claimed reviews:', error);
        return [];
      }

      return claims?.map(claim => ({
        ...claim.reviews,
        claimType: claim.claim_type,
        claimedAt: claim.claimed_at,
        business_profile: claim.reviews?.profiles,
        reviewerName: claim.reviews?.profiles?.name || 'Business',
        reviewerAvatar: claim.reviews?.profiles?.avatar || '',
        reviewerVerified: claim.reviews?.profiles?.verified || false,
        isClaimed: true
      })) || [];
    } catch (error) {
      console.error('Error in getUserClaimedReviews:', error);
      return [];
    }
  };

  // Check if user has claimed a specific review
  const isReviewClaimedByUser = async (reviewId: string): Promise<boolean> => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return false;

      const { data, error } = await supabase
        .from('review_claims')
        .select('id')
        .eq('review_id', reviewId)
        .eq('claimed_by', currentUser.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking review claim:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isReviewClaimedByUser:', error);
      return false;
    }
  };

  return {
    claimReview,
    getUserClaimedReviews,
    isReviewClaimedByUser,
    isLoading
  };
};