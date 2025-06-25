
import { ProfileData } from "../services/profileService";
import { Review } from "@/types";
import { User } from "@/types";

interface AuthorNameResult {
  authorName: string;
  authorAvatar: string;
}

export const resolveAuthorName = (
  response: any,
  profile: ProfileData | undefined,
  review: Review,
  businessInfoMap: Map<string, string>,
  currentUser: User | null
): AuthorNameResult => {
  let authorName = 'Unknown User';
  let authorAvatar = '';
  
  console.log(`\n🔍 Processing response ${response.id}`);
  console.log(`📝 Author ID: ${response.author_id}`);
  console.log(`👤 Profile found:`, profile);
  console.log(`🎯 Review customerId: ${review.customerId}`);
  console.log(`🎯 Review reviewerId: ${review.reviewerId}`);

  // PRIORITY 1: If this response is from the customer that claimed the review
  if (response.author_id === review.customerId && review.customerId) {
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
  else if (response.author_id === review.reviewerId && review.reviewerId) {
    console.log('✅ Response is from the business who wrote the review');
    
    if (profile) {
      // First check if we have business info for this business
      const businessName = businessInfoMap.get(response.author_id);
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
      const businessName = businessInfoMap.get(response.author_id);
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
    console.log(`❌ No profile found for author ID: ${response.author_id}`);
    
    // Enhanced fallback logic when no profile is found
    if (response.author_id === review.customerId && review.customerName) {
      authorName = review.customerName;
      console.log(`🔄 Using review customerName as fallback: "${authorName}"`);
    } else if (response.author_id === review.reviewerId && review.reviewerName) {
      authorName = review.reviewerName;
      console.log(`🔄 Using review reviewerName as fallback: "${authorName}"`);
    } else {
      // Last resort: check if this is a known user ID from the current user context
      if (currentUser && response.author_id === currentUser.id) {
        // Use the name property from currentUser, or construct from available data
        authorName = currentUser.name || 'You';
        console.log(`🔄 Using current user data as fallback: "${authorName}"`);
      } else {
        authorName = 'Unknown User';
        console.log(`❌ Keeping as Unknown User`);
      }
    }
  }

  return { authorName, authorAvatar };
};
