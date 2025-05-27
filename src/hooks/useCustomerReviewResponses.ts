
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
        // Use the existing responses table instead of review_responses
        const { data: responseData, error } = await supabase
          .from('responses')
          .select('*')
          .eq('review_id', reviewId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching responses:', error);
          return;
        }

        const formattedResponses = responseData?.map((resp: any) => ({
          id: resp.id,
          authorId: resp.author_id || '',
          authorName: resp.author_name || 'User',
          content: resp.content,
          createdAt: resp.created_at
        })) || [];

        setResponses(formattedResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    fetchResponses();
  }, [reviewId]);

  return { responses, setResponses };
};
