
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
  responses?: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
}

export const useEnhancedResponses = (review: Review, customerData?: CustomerData, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reviewResponses', review.id],
    queryFn: async () => {
      console.log(`useEnhancedResponses: Fetching responses for review ${review.id}`);
      
      // First get the responses
      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .select('id, author_id, content, created_at')
        .eq('review_id', review.id)
        .order('created_at', { ascending: true });

      if (responseError) {
        console.error('useEnhancedResponses: Error fetching responses:', responseError);
        return review.responses || [];
      }

      if (!responseData || responseData.length === 0) {
        return [];
      }

      // Get author information for each response
      const authorIds = responseData.map(r => r.author_id).filter(Boolean);
      
      if (authorIds.length === 0) {
        return [];
      }

      console.log('useEnhancedResponses: Author IDs to fetch:', authorIds);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, first_name, last_name, type')
        .in('id', authorIds);

      if (profileError) {
        console.error('useEnhancedResponses: Error fetching author profiles:', profileError);
        return review.responses || [];
      }

      console.log('useEnhancedResponses: Profile data found:', profileData);

      // Get the customer name from either customerData or review data
      const customerFullName = customerData 
        ? `${customerData.firstName} ${customerData.lastName}`.trim()
        : review.customer_name || '';

      console.log('useEnhancedResponses: Customer full name for responses:', customerFullName);
      console.log('useEnhancedResponses: Review author (business):', review.reviewerName);

      // Enhanced logic to get proper names for all response authors
      const formattedResponses = responseData.map((resp: any) => {
        const profile = profileData?.find(p => p.id === resp.author_id);
        
        let authorName = 'User'; // Default fallback
        
        console.log(`\n=== PROCESSING RESPONSE ${resp.id} ===`);
        console.log(`Response author_id: ${resp.author_id}`);
        console.log(`Review customerId: ${review.customerId}`);
        console.log(`Review reviewerId (business): ${review.reviewerId}`);
        console.log(`CustomerData:`, customerData);
        console.log(`Profile found:`, profile);
        
        // PRIORITY 1: If this response is from the customer that the review is about
        if (resp.author_id === review.customerId) {
          console.log('✅ Response is from the customer that the review is about');
          
          // Use customerData if available (this should be Isaac Wiley)
          if (customerFullName && customerFullName.trim()) {
            authorName = customerFullName;
            console.log(`✅ Using derived customer full name: "${authorName}"`);
          }
          // Then try profile data
          else if (profile) {
            if (profile.first_name && profile.last_name) {
              authorName = `${profile.first_name} ${profile.last_name}`;
              console.log(`✅ Using profile first+last name: "${authorName}"`);
            } else if (profile.first_name) {
              authorName = profile.first_name;
              console.log(`✅ Using profile first name: "${authorName}"`);
            } else if (profile.last_name) {
              authorName = profile.last_name;
              console.log(`✅ Using profile last name: "${authorName}"`);
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using profile name field: "${authorName}"`);
            }
          }
        }
        // PRIORITY 2: If this response is from the business who wrote the review
        else if (resp.author_id === review.reviewerId) {
          console.log('✅ Response is from the business who wrote the review');
          
          // First try to use the reviewer name from the review data
          if (review.reviewerName && review.reviewerName.trim()) {
            authorName = review.reviewerName;
            console.log(`✅ Using review's reviewerName: "${authorName}"`);
          }
          // Then try profile data
          else if (profile) {
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using profile name field: "${authorName}"`);
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
              console.log(`✅ Using profile first+last name: "${authorName}"`);
            } else {
              authorName = 'Business';
              console.log(`✅ Using fallback business name: "${authorName}"`);
            }
          }
        }
        // PRIORITY 3: If we have profile data for other users
        else if (profile) {
          console.log('📝 Processing response from other user');
          // For customer accounts, prefer the constructed name from first_name + last_name
          if (profile.type === 'customer') {
            if (profile.first_name && profile.last_name) {
              authorName = `${profile.first_name} ${profile.last_name}`;
            } else if (profile.first_name) {
              authorName = profile.first_name;
            } else if (profile.last_name) {
              authorName = profile.last_name;
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            } else {
              authorName = 'Customer';
            }
          } else {
            // For business accounts, prefer the name field
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
            } else {
              authorName = profile.type === 'business' ? 'Business' : 'User';
            }
          }
          
          console.log(`📝 Final name for other user: "${authorName}"`);
        } else {
          console.log(`❌ No profile found for author ${resp.author_id}`);
        }

        console.log(`🎯 FINAL AUTHOR NAME: "${authorName}"`);
        console.log(`=== END PROCESSING RESPONSE ${resp.id} ===\n`);

        return {
          id: resp.id,
          authorId: resp.author_id || '',
          authorName,
          content: resp.content,
          createdAt: resp.created_at
        };
      });

      console.log('useEnhancedResponses: Enhanced responses with proper author names:', formattedResponses);
      return formattedResponses;
    },
    enabled: enabled && !!review.id
  });
};
