import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useReviewAssociation = () => {
  const { toast } = useToast();

  const createAssociation = async (
    customerId: string, 
    reviewId: string, 
    associationType: 'purchased' | 'responded'
  ) => {
    try {
      const { error } = await supabase
        .from('customer_review_associations')
        .insert({
          customer_id: customerId,
          review_id: reviewId,
          association_type: associationType
        });

      if (error) {
        console.error('Error creating review association:', error);
        throw error;
      }

      console.log(`✅ Review association created: ${associationType} for review ${reviewId}`);
      return true;
    } catch (error) {
      console.error('Failed to create review association:', error);
      toast({
        title: "Error",
        description: "Failed to save review association.",
        variant: "destructive"
      });
      return false;
    }
  };

  const isReviewAssociated = async (customerId: string, reviewId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_review_associations')
        .select('id')
        .eq('customer_id', customerId)
        .eq('review_id', reviewId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking review association:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Failed to check review association:', error);
      return false;
    }
  };

  return {
    createAssociation,
    isReviewAssociated
  };
};