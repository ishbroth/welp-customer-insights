
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types";

export const useBusinessProfileReviews = (businessId: string | undefined, hasAccess: boolean) => {
  const { 
    data: reviews, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['businessProfileReviews', businessId],
    queryFn: async () => {
      if (!businessId || !hasAccess) {
        return [];
      }
      
      console.log("Fetching reviews for business ID:", businessId);
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching business reviews:", error);
        throw error;
      }
      
      // Transform the data to match the Review type
      const transformedReviews: Review[] = (data || []).map(review => ({
        id: review.id,
        reviewerId: review.business_id || '',
        reviewerName: review.customer_name || 'Anonymous',
        customerId: review.customer_id || '',
        customerName: review.customer_name || 'Anonymous',
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        location: `${review.customer_city || ''}, ${review.customer_zipcode || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') || 'Unknown',
        reactions: { like: [], funny: [], ohNo: [] },
        responses: []
      }));
      
      console.log("Transformed business reviews:", transformedReviews);
      return transformedReviews;
    },
    enabled: !!businessId && hasAccess,
    retry: 1
  });

  return {
    reviews,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
