
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: ReviewResponse[];
}

export const useReviewResponses = (reviewId: string) => {
  const [responses, setResponses] = useState<ReviewResponse[]>([]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        // Use the existing responses table
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
          createdAt: resp.created_at,
          replies: []
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
