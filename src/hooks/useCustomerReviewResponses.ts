
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
        
        // First get the responses
        const { data: responseData, error: responseError } = await supabase
          .from('responses')
          .select('id, author_id, content, created_at')
          .eq('review_id', reviewId)
          .order('created_at', { ascending: true });

        if (responseError) {
          console.error('Error fetching responses:', responseError);
          return;
        }

        console.log('Raw response data:', responseData);

        if (!responseData || responseData.length === 0) {
          setResponses([]);
          return;
        }

        // Get author information for each response
        const authorIds = responseData.map(r => r.author_id).filter(Boolean);
        
        if (authorIds.length === 0) {
          setResponses([]);
          return;
        }

        console.log('Author IDs to fetch:', authorIds);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, first_name, last_name, type')
          .in('id', authorIds);

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
          return;
        }

        console.log('Profile data found:', profileData);

        // Combine response data with profile data
        const formattedResponses = responseData.map((resp: any) => {
          const profile = profileData?.find(p => p.id === resp.author_id);
          
          let authorName = 'User'; // Default fallback
          
          if (profile) {
            // First try to use the 'name' field
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            }
            // If no name, try to construct from first_name and last_name
            else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
            }
            // If still no name, use account type with a more descriptive fallback
            else if (profile.type) {
              authorName = profile.type === 'business' ? 'Business User' : 'Customer';
            }
            
            console.log(`Response author mapping: ${resp.author_id} -> ${authorName} (profile name: ${profile.name}, first: ${profile.first_name}, last: ${profile.last_name}, type: ${profile.type})`);
          } else {
            console.log(`No profile found for author ${resp.author_id}`);
          }

          return {
            id: resp.id,
            authorId: resp.author_id || '',
            authorName,
            content: resp.content,
            createdAt: resp.created_at
          };
        });

        console.log('Formatted responses with proper author names:', formattedResponses);
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
