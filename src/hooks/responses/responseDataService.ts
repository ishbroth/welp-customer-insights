import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Response } from "./types";
import { Review } from "@/types";

export const useResponseDataService = () => {
  const { currentUser } = useAuth();

  const fetchAndFormatResponses = async (review: Review): Promise<Response[]> => {
    try {
      console.log('Fetching responses for review', review.id);

      // First get the responses
      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .select('id, author_id, content, created_at')
        .eq('review_id', review.id)
        .order('created_at', { ascending: true });

      if (responseError) {
        console.error('Error fetching responses:', responseError);
        return [];
      }

      if (!responseData || responseData.length === 0) {
        return [];
      }

      console.log('Raw response data:', responseData);

      // Get all unique author IDs
      const authorIds = responseData.map(r => r.author_id).filter(Boolean);
      
      if (authorIds.length === 0) {
        return [];
      }

      console.log('Fetching profiles for author IDs:', authorIds);

      // Fetch profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, first_name, last_name, type, avatar')
        .in('id', authorIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      }

      // Fetch business info for business accounts to get proper business names
      const businessAuthorIds = profiles?.filter(p => p.type === 'business').map(p => p.id) || [];
      let businessInfoMap = new Map();
      
      if (businessAuthorIds.length > 0) {
        const { data: businessData, error: businessError } = await supabase
          .from('business_info')
          .select('id, business_name')
          .in('id', businessAuthorIds);

        if (!businessError && businessData) {
          businessData.forEach(business => {
            businessInfoMap.set(business.id, business.business_name);
          });
        }
      }

      console.log('Profile data found:', profiles);
      console.log('Business info map:', businessInfoMap);

      // Process each response and assign proper author information
      const formattedResponses = responseData.map((resp: any) => {
        const profile = profiles?.find((p: any) => p.id === resp.author_id);
        
        let authorName = 'User';
        let authorAvatar = '';
        
        console.log(`\n=== Processing response ${resp.id} ===`);
        console.log(`Author ID: ${resp.author_id}`);
        console.log(`Review customerId: ${review.customerId}`);
        console.log(`Review reviewerId (business): ${review.reviewerId}`);
        console.log(`Profile found:`, profile);

        if (profile) {
          // If this is a business account responding
          if (profile.type === 'business') {
            // First priority: Use business_info business_name
            const businessName = businessInfoMap.get(resp.author_id);
            if (businessName && businessName.trim()) {
              authorName = businessName;
              console.log(`✅ Using business_info business_name: "${authorName}"`);
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
              authorName = 'Business';
              console.log(`✅ Using fallback business name: "${authorName}"`);
            }
          }
          // If this is a customer account responding
          else if (profile.type === 'customer') {
            // Construct full name from first_name + last_name for customers
            if (profile.first_name && profile.last_name) {
              authorName = `${profile.first_name} ${profile.last_name}`;
              console.log(`✅ Using customer first+last name: "${authorName}"`);
            } else if (profile.first_name) {
              authorName = profile.first_name;
              console.log(`✅ Using customer first name: "${authorName}"`);
            } else if (profile.last_name) {
              authorName = profile.last_name;
              console.log(`✅ Using customer last name: "${authorName}"`);
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using customer profile name: "${authorName}"`);
            } else {
              authorName = 'Customer';
              console.log(`✅ Using fallback customer name: "${authorName}"`);
            }
          }
          // Other account types
          else {
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
            }
            console.log(`✅ Using name for other account type: "${authorName}"`);
          }
          
          // Use profile avatar
          authorAvatar = profile.avatar || '';
        }

        console.log(`🎯 Final author info: name="${authorName}", avatar="${authorAvatar}"`);
        console.log(`=== End processing response ${resp.id} ===\n`);

        return {
          id: resp.id,
          authorId: resp.author_id || '',
          authorName,
          content: resp.content,
          createdAt: resp.created_at,
          authorAvatar
        };
      });

      console.log('Final formatted responses:', formattedResponses);
      return formattedResponses;
    } catch (error) {
      console.error('Error fetching responses:', error);
      return [];
    }
  };

  return { fetchAndFormatResponses };
};
