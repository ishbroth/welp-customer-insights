
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerData {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  avatar?: string;
}

interface Review {
  id: string;
  customerId?: string;
  customer_name?: string;
  reviewerId?: string;
  reviewerName?: string;
}

export const useSimplifiedResponses = (review: Review, customerData?: CustomerData, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['simplifiedResponses', review.id],
    queryFn: async () => {
      console.log(`useSimplifiedResponses: Fetching responses for review ${review.id}`);
      
      // Fetch the responses
      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .select('id, author_id, content, created_at')
        .eq('review_id', review.id)
        .order('created_at', { ascending: true });

      if (responseError) {
        console.error('useSimplifiedResponses: Error fetching responses:', responseError);
        return [];
      }

      if (!responseData || responseData.length === 0) {
        return [];
      }

      // Get the customer name from either customerData or review data
      const customerFullName = customerData 
        ? `${customerData.firstName} ${customerData.lastName}`.trim()
        : review.customer_name || 'Customer';

      // ALWAYS use the business name from the review - this is displayed in the review card
      const businessName = review.reviewerName || 'Business';

      console.log('useSimplifiedResponses: Customer name:', customerFullName);
      console.log('useSimplifiedResponses: Business name (from review card):', businessName);

      // Format responses with strict alternating names - NO "User" fallbacks allowed
      const formattedResponses = responseData.map((resp: any, index: number) => {
        const isCustomerResponse = index % 2 === 0;
        
        // Strict alternating: Customer for even indexes (0, 2, 4...), Business for odd indexes (1, 3, 5...)
        const authorName = isCustomerResponse ? customerFullName : businessName;

        console.log(`Response ${index + 1}: ${authorName} (${isCustomerResponse ? 'Customer' : 'Business'})`);

        return {
          id: resp.id,
          authorId: resp.author_id || '',
          authorName,
          content: resp.content,
          createdAt: resp.created_at
        };
      });

      console.log('useSimplifiedResponses: Final formatted responses:', formattedResponses);
      return formattedResponses;
    },
    enabled: enabled && !!review.id
  });
};
