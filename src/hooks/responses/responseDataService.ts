
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Response } from "./types";
import { Review } from "@/types";

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
      
      if (authorIds.length === 0) {
        console.log('❌ No valid author IDs found');
        return [];
      }

      console.log('👥 Fetching profiles for author IDs:', authorIds);

      // Fetch profiles with more detailed logging
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, first_name, last_name, type, avatar')
        .in('id', authorIds);

      if (profileError) {
        console.error('❌ Error fetching profiles:', profileError);
      }

      console.log('👤 Profile data retrieved:', profiles);

      // Fetch business info for business accounts to get proper business names
      const businessAuthorIds = profiles?.filter(p => p.type === 'business').map(p => p.id) || [];
      let businessInfoMap = new Map();
      
      if (businessAuthorIds.length > 0) {
        console.log('🏢 Fetching business info for IDs:', businessAuthorIds);
        const { data: businessData, error: businessError } = await supabase
          .from('business_info')
          .select('id, business_name')
          .in('id', businessAuthorIds);

        if (!businessError && businessData) {
          console.log('🏢 Business info retrieved:', businessData);
          businessData.forEach(business => {
            businessInfoMap.set(business.id, business.business_name);
          });
        } else {
          console.error('❌ Error fetching business info:', businessError);
        }
      }

      // Process each response and assign proper author information
      const formattedResponses = responseData.map((resp: any) => {
        const profile = profiles?.find((p: any) => p.id === resp.author_id);
        
        let authorName = 'Unknown User';
        let authorAvatar = '';
        
        console.log(`\n🔍 Processing response ${resp.id}`);
        console.log(`📝 Author ID: ${resp.author_id}`);
        console.log(`👤 Profile found:`, profile);

        if (profile) {
          // If this is a business account responding
          if (profile.type === 'business') {
            // First priority: Use business_info business_name
            const businessName = businessInfoMap.get(resp.author_id);
            if (businessName && businessName.trim()) {
              authorName = businessName;
              console.log(`✅ Using business_info name: "${authorName}"`);
            }
            // Fallback to profile name
            else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using profile name for business: "${authorName}"`);
            }
            // Last resort: construct from first/last name
            else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
              console.log(`✅ Using constructed name for business: "${authorName}"`);
            }
            else {
              authorName = 'Business User';
              console.log(`⚠️ Using fallback business name: "${authorName}"`);
            }
          }
          // If this is a customer account responding
          else if (profile.type === 'customer') {
            // For customers, prioritize first_name + last_name combination
            if (profile.first_name && profile.last_name) {
              authorName = `${profile.first_name} ${profile.last_name}`;
              console.log(`✅ Using customer first+last name: "${authorName}"`);
            } else if (profile.first_name) {
              authorName = profile.first_name;
              console.log(`✅ Using customer first name only: "${authorName}"`);
            } else if (profile.last_name) {
              authorName = profile.last_name;
              console.log(`✅ Using customer last name only: "${authorName}"`);
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using customer profile name: "${authorName}"`);
            } else {
              authorName = 'Customer';
              console.log(`⚠️ Using fallback customer name: "${authorName}"`);
            }
          }
          // Handle other account types
          else {
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using profile name for other type: "${authorName}"`);
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
              console.log(`✅ Using constructed name for other type: "${authorName}"`);
            } else {
              authorName = 'User';
              console.log(`⚠️ Using generic fallback: "${authorName}"`);
            }
          }
          
          // Use profile avatar
          authorAvatar = profile.avatar || '';
          console.log(`🖼️ Avatar URL: "${authorAvatar}"`);
        } else {
          console.log(`❌ No profile found for author ID: ${resp.author_id}`);
          authorName = 'Unknown User';
        }

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
