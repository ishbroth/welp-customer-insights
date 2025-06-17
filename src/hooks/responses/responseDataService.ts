
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

      console.log('Profile data found:', profiles);

      // Process each response and assign proper author information
      const formattedResponses = responseData.map((resp: any) => {
        const profile = profiles?.find((p: any) => p.id === resp.author_id);
        
        let authorName = 'User';
        let authorAvatar = '';
        
        console.log(`\n=== Processing response ${resp.id} ===`);
        console.log(`Author ID: ${resp.author_id}`);
        console.log(`Review customerId: ${review.customerId}`);
        console.log(`Profile found:`, profile);

        // Check if this response is from the customer who the review is about
        if (resp.author_id === review.customerId && review.customerId) {
          console.log('✅ This is a response from the customer the review is about');
          
          // First priority: Use profile data if available
          if (profile) {
            // Construct full name from profile
            if (profile.first_name && profile.last_name) {
              authorName = `${profile.first_name} ${profile.last_name}`;
              console.log(`Using profile first+last name: ${authorName}`);
            } else if (profile.first_name) {
              authorName = profile.first_name;
              console.log(`Using profile first name: ${authorName}`);
            } else if (profile.last_name) {
              authorName = profile.last_name;
              console.log(`Using profile last name: ${authorName}`);
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`Using profile name field: ${authorName}`);
            }
            
            // Use profile avatar
            authorAvatar = profile.avatar || '';
            console.log(`Using profile avatar: ${authorAvatar}`);
          }
          
          // Fallback to review customer name if no profile name available
          if (authorName === 'User' && review.customerName && review.customerName.trim()) {
            authorName = review.customerName;
            console.log(`Fallback to review customerName: ${authorName}`);
          }
        }
        // Check if this response is from the current business user
        else if (resp.author_id === currentUser?.id) {
          console.log('✅ This is a response from the current business user');
          
          // Use current user data directly
          authorName = currentUser.name || 'Business User';
          authorAvatar = currentUser.avatar || '';
          
          console.log(`Business user name: ${authorName}`);
        }
        // Handle other users
        else if (profile) {
          console.log('📝 Processing response from other user');
          
          if (profile.type === 'business') {
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
            } else {
              authorName = 'Business';
            }
          } else if (profile.type === 'customer') {
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
          }
          
          authorAvatar = profile.avatar || '';
          console.log(`Other user name: ${authorName}`);
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
