
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSimplifiedResponses = (
  review: any,
  customerData?: any,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['simplifiedResponses', review.id, review.reviewerId],
    queryFn: async () => {
      console.log(`useSimplifiedResponses: Fetching responses for review ${review.id}`);
      
      const { data: responses, error } = await supabase
        .from('responses')
        .select(`
          id,
          author_id,
          content,
          created_at
        `)
        .eq('review_id', review.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching responses:', error);
        return [];
      }

      if (!responses || responses.length === 0) {
        return [];
      }

      // Get unique author IDs
      const authorIds = [...new Set(responses.map(r => r.author_id))];
      
      // Fetch author profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, first_name, last_name')
        .in('id', authorIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Format responses with proper author names
      const formattedResponses = responses.map(response => {
        const profile = profilesMap.get(response.author_id);
        let authorName = 'Unknown';

        if (response.author_id === review.reviewerId) {
          // Business response
          authorName = review.reviewerName || 'Business';
        } else if (profile) {
          // Customer response
          authorName = profile.name || 
                     (profile.first_name && profile.last_name 
                       ? `${profile.first_name} ${profile.last_name}` 
                       : 'Customer');
        }

        return {
          id: response.id,
          authorId: response.author_id,
          authorName,
          content: response.content,
          createdAt: response.created_at
        };
      });

      console.log(`useSimplifiedResponses: Formatted ${formattedResponses.length} responses`);
      return formattedResponses;
    },
    enabled: enabled && !!review.id
  });
};
