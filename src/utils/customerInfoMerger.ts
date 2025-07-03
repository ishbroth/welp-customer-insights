import { supabase } from "@/integrations/supabase/client";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";

export interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  avatar?: string;
  isVerified?: boolean;
  isClaimed: boolean;
  matchConfidence?: 'exact' | 'high' | 'potential' | 'none';
  potentialMatchId?: string;
}

export interface ReviewCustomerData {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_zipcode?: string;
  customerId?: string;
}

export interface CustomerProfile {
  id: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  verified?: boolean;
}

export const mergeCustomerInfo = (
  reviewData: ReviewCustomerData,
  customerProfile?: CustomerProfile | null,
  potentialMatches?: CustomerProfile[]
): CustomerInfo => {
  const isClaimed = !!reviewData.customerId;
  
  // Start with business input data from review
  let name = reviewData.customer_name || 'Customer';
  let phone = reviewData.customer_phone || '';
  let address = reviewData.customer_address || '';
  let city = reviewData.customer_city || '';
  let state = '';
  let zipCode = reviewData.customer_zipcode || '';
  let avatar = '';
  let isVerified = false;
  let matchConfidence: 'exact' | 'high' | 'potential' | 'none' = 'none';
  let potentialMatchId: string | undefined;

  // Handle claimed reviews - use actual customer profile data
  if (isClaimed && customerProfile) {
    // Name: prioritize first_name + last_name, then name, then fall back to review data
    if (customerProfile.first_name && customerProfile.last_name) {
      name = `${customerProfile.first_name} ${customerProfile.last_name}`;
    } else if (customerProfile.first_name) {
      name = customerProfile.first_name;
    } else if (customerProfile.last_name) {
      name = customerProfile.last_name;
    } else if (customerProfile.name && customerProfile.name.trim()) {
      name = customerProfile.name;
    }

    // Override other fields with profile data if available, otherwise keep business input
    phone = customerProfile.phone || phone;
    address = customerProfile.address || address;
    city = customerProfile.city || city;
    state = customerProfile.state || state;
    zipCode = customerProfile.zipcode || zipCode;
    avatar = customerProfile.avatar || '';
    isVerified = customerProfile.verified || false;
    matchConfidence = 'exact';
  } 
  // Handle unclaimed reviews - try to find potential matches
  else if (!isClaimed && potentialMatches && potentialMatches.length > 0) {
    const bestMatch = findBestPotentialMatch(reviewData, potentialMatches);
    
    if (bestMatch.profile && bestMatch.confidence >= 0.8) {
      // High confidence match - use profile data for avatar and supplementary info
      avatar = bestMatch.profile.avatar || '';
      potentialMatchId = bestMatch.profile.id;
      matchConfidence = bestMatch.confidence >= 0.9 ? 'high' : 'potential';
      
      // For high confidence matches, supplement missing data from profile
      if (bestMatch.confidence >= 0.9) {
        phone = phone || bestMatch.profile.phone || '';
        address = address || bestMatch.profile.address || '';
        city = city || bestMatch.profile.city || '';
        state = state || bestMatch.profile.state || '';
        zipCode = zipCode || bestMatch.profile.zipcode || '';
      }
    }
  }

  return {
    name,
    phone: phone || undefined,
    address: address || undefined,
    city: city || undefined,
    state: state || undefined,
    zipCode: zipCode || undefined,
    avatar: avatar || undefined,
    isVerified,
    isClaimed,
    matchConfidence,
    potentialMatchId
  };
};

const findBestPotentialMatch = (
  reviewData: ReviewCustomerData,
  potentialMatches: CustomerProfile[]
): { profile: CustomerProfile | null; confidence: number } => {
  let bestMatch: CustomerProfile | null = null;
  let bestScore = 0;

  for (const profile of potentialMatches) {
    let score = 0;
    const maxScore = 100;

    // Name matching (40 points max)
    if (reviewData.customer_name) {
      const profileName = profile.name || 
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      
      if (profileName) {
        const similarity = calculateStringSimilarity(reviewData.customer_name, profileName);
        score += similarity * 40;
      }
    }

    // Phone matching (35 points max)
    if (reviewData.customer_phone && profile.phone) {
      const reviewPhone = reviewData.customer_phone.replace(/\D/g, '');
      const profilePhone = profile.phone.replace(/\D/g, '');
      
      if (reviewPhone && profilePhone && reviewPhone === profilePhone) {
        score += 35;
      }
    }

    // Address matching (15 points max)
    if (reviewData.customer_address && profile.address) {
      const similarity = calculateStringSimilarity(reviewData.customer_address, profile.address);
      score += similarity * 15;
    }

    // City matching (10 points max)
    if (reviewData.customer_city && profile.city) {
      const similarity = calculateStringSimilarity(reviewData.customer_city, profile.city);
      score += similarity * 10;
    }

    const normalizedScore = score / maxScore;
    if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      bestMatch = profile;
    }
  }

  return { profile: bestMatch, confidence: bestScore };
};

export const fetchCustomerProfile = async (customerId?: string): Promise<CustomerProfile | null> => {
  if (!customerId) return null;
  
  console.log(`Fetching customer profile for ID: ${customerId}`);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, avatar, first_name, last_name, name, phone, address, city, state, zipcode, verified')
    .eq('id', customerId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching customer profile:", error);
    return null;
  }
  
  console.log(`Customer profile found:`, data);
  return data;
};

export const findPotentialCustomerMatches = async (
  reviewData: ReviewCustomerData
): Promise<CustomerProfile[]> => {
  if (!reviewData.customer_name && !reviewData.customer_phone) {
    return [];
  }

  console.log(`Finding potential customer matches for:`, reviewData);
  
  try {
    let query = supabase
      .from('profiles')
      .select('id, avatar, first_name, last_name, name, phone, address, city, state, zipcode, verified')
      .eq('type', 'customer');

    // Search by phone first (most reliable)
    if (reviewData.customer_phone) {
      const cleanPhone = reviewData.customer_phone.replace(/\D/g, '');
      if (cleanPhone) {
        const { data: phoneMatches } = await query
          .or(`phone.ilike.%${cleanPhone}%`)
          .limit(5);
        
        if (phoneMatches && phoneMatches.length > 0) {
          console.log(`Found ${phoneMatches.length} phone matches`);
          return phoneMatches;
        }
      }
    }

    // Search by name if no phone matches
    if (reviewData.customer_name) {
      const nameParts = reviewData.customer_name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Try exact name match first
      const { data: exactMatches } = await query
        .or(`name.ilike.%${reviewData.customer_name}%,first_name.ilike.%${firstName}%`)
        .limit(10);

      if (exactMatches && exactMatches.length > 0) {
        console.log(`Found ${exactMatches.length} name matches`);
        return exactMatches;
      }

      // Try fuzzy name matching
      const { data: fuzzyMatches } = await query
        .or(`name.ilike.%${firstName}%,first_name.ilike.%${firstName}%`)
        .limit(10);

      if (fuzzyMatches && fuzzyMatches.length > 0) {
        console.log(`Found ${fuzzyMatches.length} fuzzy matches`);
        return fuzzyMatches;
      }
    }

    return [];
  } catch (error) {
    console.error("Error finding potential customer matches:", error);
    return [];
  }
};
