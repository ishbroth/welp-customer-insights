
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Response } from "./types";
import { Review } from "@/types";
import { fetchProfiles } from "./services/profileService";
import { fetchBusinessInfo } from "./services/businessInfoService";
import { resolveAuthorName } from "./utils/authorNameResolver";

export const useResponseDataService = () => {
  const { currentUser } = useAuth();

  const fetchAndFormatResponses = async (review: Review): Promise<Response[]> => {
    try {
      console.log('🔍 Fetching responses for review', review.id);

      // First get the responses
      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .select('id, author_id, content, created_at')
        .eq('review_id', review.id)
        .order('created_at', { ascending: true });

      if (responseError) {
        console.error('❌ Error fetching responses:', responseError);
        return [];
      }

      if (!responseData || responseData.length === 0) {
        console.log('📝 No responses found for review', review.id);
        return [];
      }

      console.log('📊 Raw response data:', responseData);

      // Get all unique author IDs
      const authorIds = responseData.map(r => r.author_id).filter(Boolean);
      
      // Fetch profiles
      const profiles = await fetchProfiles(authorIds);

      // Fetch business info for business accounts
      const businessAuthorIds = profiles?.filter(p => p.type === 'business').map(p => p.id) || [];
      const businessInfoMap = await fetchBusinessInfo(businessAuthorIds);

      // Process each response and assign proper author information
      const formattedResponses = responseData.map((resp: any) => {
        const profile = profiles?.find((p: any) => p.id === resp.author_id);
        
        const { authorName, authorAvatar } = resolveAuthorName(
          resp,
          profile,
          review,
          businessInfoMap,
          currentUser
        );

        const formattedResponse = {
          id: resp.id,
          authorId: resp.author_id || '',
          authorName,
          content: resp.content,
          createdAt: resp.created_at,
          authorAvatar
        };

        console.log(`🎯 Final response format:`, formattedResponse);
        console.log(`=== End processing response ${resp.id} ===\n`);

        return formattedResponse;
      });

      console.log('✅ All formatted responses:', formattedResponses);
      return formattedResponses;
    } catch (error) {
      console.error('💥 Error fetching responses:', error);
      return [];
    }
  };

  return { fetchAndFormatResponses };
};
