
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
        // Fetch responses with author information from profiles
        const { data: responseData, error } = await supabase
          .from('responses')
          .select(`
            *,
            profiles!author_id (
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

        setResponses(formattedResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    fetchResponses();
  }, [reviewId]);

  return { responses, setResponses };
};
