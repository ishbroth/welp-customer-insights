
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
        console.log(`🎯 Review customerId: ${review.customerId}`);
        console.log(`🎯 Review reviewerId: ${review.reviewerId}`);

        // PRIORITY 1: If this response is from the customer that claimed the review
        if (resp.author_id === review.customerId && review.customerId) {
          console.log('✅ Response is from the customer who claimed the review');
          
          if (profile) {
            // Use profile data first
            if (profile.first_name && profile.last_name) {
              authorName = `${profile.first_name} ${profile.last_name}`;
              console.log(`✅ Using profile first+last name: "${authorName}"`);
            } else if (profile.first_name) {
              authorName = profile.first_name;
              console.log(`✅ Using profile first name: "${authorName}"`);
            } else if (profile.last_name) {
              authorName = profile.last_name;
              console.log(`✅ Using profile last name: "${authorName}"`);
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using profile name field: "${authorName}"`);
            }
            
            // Use profile avatar
            authorAvatar = profile.avatar || '';
            console.log(`✅ Using customer profile avatar: "${authorAvatar}"`);
          } else {
            console.log('⚠️ No profile found for customer, using review data as fallback');
            // Fallback to review data if no profile found
            if (review.customerName && review.customerName.trim()) {
              authorName = review.customerName;
              console.log(`✅ Using review's customerName as fallback: "${authorName}"`);
            }
          }
        }
        // PRIORITY 2: If this response is from the business who wrote the review
        else if (resp.author_id === review.reviewerId && review.reviewerId) {
          console.log('✅ Response is from the business who wrote the review');
          
          if (profile) {
            // First check if we have business info for this business
            const businessName = businessInfoMap.get(resp.author_id);
            if (businessName && businessName.trim()) {
              authorName = businessName;
              console.log(`✅ Using business_info business_name: "${authorName}"`);
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`✅ Using profile name field: "${authorName}"`);
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
              console.log(`✅ Using profile first+last name: "${authorName}"`);
            }
            
            // Use profile avatar
            authorAvatar = profile.avatar || '';
            console.log(`🖼️ Business avatar URL: "${authorAvatar}"`);
          } else {
            console.log('⚠️ No profile found for business, using review data as fallback');
            // Fallback to review data if no profile found
            if (review.reviewerName && review.reviewerName.trim()) {
              authorName = review.reviewerName;
              console.log(`✅ Using review's reviewerName as fallback: "${authorName}"`);
            } else {
              authorName = 'Business';
              console.log(`✅ Using fallback business name: "${authorName}"`);
            }
          }
        }
        // PRIORITY 3: Handle other users with profile data
        else if (profile) {
          console.log('📝 Processing response from other user');
          
          // For business accounts, prioritize business name from business_info
          if (profile.type === 'business') {
            const businessName = businessInfoMap.get(resp.author_id);
            if (businessName && businessName.trim()) {
              authorName = businessName;
              console.log(`📝 Using business_info business_name: "${authorName}"`);
            } else if (profile.name && profile.name.trim()) {
              authorName = profile.name;
              console.log(`📝 Using profile name field: "${authorName}"`);
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
              console.log(`📝 Using profile first+last name: "${authorName}"`);
            } else {
              authorName = 'Business';
              console.log(`📝 Using fallback business name: "${authorName}"`);
            }
          }
          // For customer accounts, prefer the constructed name from first_name + last_name
          else if (profile.type === 'customer') {
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
            console.log(`📝 Final name for customer: "${authorName}"`);
          }
          // For other account types
          else {
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
            } else {
              authorName = 'User';
            }
            console.log(`📝 Final name for other user: "${authorName}"`);
          }
          
          // Use profile avatar
          authorAvatar = profile.avatar || '';
          console.log(`🖼️ Avatar URL: "${authorAvatar}"`);
        } else {
          console.log(`❌ No profile found for author ID: ${resp.author_id}`);
          
          // Enhanced fallback logic when no profile is found
          if (resp.author_id === review.customerId && review.customerName) {
            authorName = review.customerName;
            console.log(`🔄 Using review customerName as fallback: "${authorName}"`);
          } else if (resp.author_id === review.reviewerId && review.reviewerName) {
            authorName = review.reviewerName;
            console.log(`🔄 Using review reviewerName as fallback: "${authorName}"`);
          } else {
            // Last resort: check if this is a known user ID from the current user context
            if (currentUser && resp.author_id === currentUser.id) {
              authorName = currentUser.name || 
                         (currentUser.first_name && currentUser.last_name 
                          ? `${currentUser.first_name} ${currentUser.last_name}` 
                          : currentUser.first_name || currentUser.last_name || 'You');
              console.log(`🔄 Using current user data as fallback: "${authorName}"`);
            } else {
              authorName = 'Unknown User';
              console.log(`❌ Keeping as Unknown User`);
            }
          }
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
