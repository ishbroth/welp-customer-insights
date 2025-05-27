
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export const useCustomerReviewResponses = (reviewId: string) => {
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        console.log('Fetching responses for review:', reviewId);
        
        // Fetch responses with author information from profiles using the proper foreign key
        const { data: responseData, error } = await supabase
          .from('responses')
          .select(`
            id,
            author_id,
            content,
            created_at,
            profiles!responses_author_id_fkey (
              name,
              first_name,
              last_name
            )
          `)
          .eq('review_id', reviewId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching responses:', error);
          return;
        }

        console.log('Raw response data:', responseData);

        const formattedResponses = responseData?.map((resp: any) => {
          const profile = resp.profiles;
          const authorName = profile?.name || 
                           (profile?.first_name && profile?.last_name 
                             ? `${profile.first_name} ${profile.last_name}` 
                             : 'User');

          return {
            id: resp.id,
            authorId: resp.author_id || '',
            authorName,
            content: resp.content,
            createdAt: resp.created_at
          };
        }) || [];

        console.log('Formatted responses:', formattedResponses);
        setResponses(formattedResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    if (reviewId) {
      fetchResponses();
    }
  }, [reviewId]);

  return { responses, setResponses };
};
