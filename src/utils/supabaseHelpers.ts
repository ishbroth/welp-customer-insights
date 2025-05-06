
import { supabase } from "@/integrations/supabase/client";
import type { 
  Profile, 
  ProfileInsert, 
  BusinessInfo, 
  BusinessInfoInsert, 
  SearchParams 
} from "@/types/supabase";

/**
 * Get a user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
  
  return data;
};

/**
 * Get a business profile with business info by ID
 */
export const getBusinessProfile = async (userId: string) => {
  // First get the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error("Error fetching business profile:", profileError);
    throw profileError;
  }
  
  // Then get the business info
  const { data: businessInfo, error: businessError } = await supabase
    .from('business_info')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (businessError) {
    console.error("Error fetching business info:", businessError);
    throw businessError;
  }
  
  // Combine the data
  return {
    ...profile,
    business_name: businessInfo.business_name,
    license_number: businessInfo.license_number,
    verified: businessInfo.verified,
  };
};

/**
 * Update a user profile
 */
export const updateUserProfile = async (userId: string, profileData: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
  
  return data;
};

/**
 * Update business information
 */
export const updateBusinessInfo = async (userId: string, businessData: Partial<BusinessInfo>) => {
  const { data, error } = await supabase
    .from('business_info')
    .update(businessData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating business info:", error);
    throw error;
  }
  
  return data;
};

/**
 * Verify a business
 */
export const verifyBusiness = async (userId: string, businessData: Partial<BusinessInfo>) => {
  const { data, error } = await supabase
    .from('business_info')
    .update({
      ...businessData,
      verified: true
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error("Error verifying business:", error);
    throw error;
  }
  
  return data;
};

/**
 * Search for customers by various parameters
 */
export const searchCustomers = async (params: SearchParams) => {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      reviews!customer_id(
        id,
        rating,
        content,
        created_at,
        business:business_id(
          id,
          profiles!business_id(
            first_name,
            last_name
          ),
          business_info!id(
            business_name
          )
        )
      )
    `)
    .eq('type', 'customer');

  // Apply filters based on provided parameters
  if (params.firstName && params.firstName.trim()) {
    query = query.ilike('first_name', `%${params.firstName.trim()}%`);
  }
  
  if (params.lastName && params.lastName.trim()) {
    query = query.ilike('last_name', `%${params.lastName.trim()}%`);
  }
  
  if (params.phone && params.phone.trim()) {
    query = query.ilike('phone', `%${params.phone.trim()}%`);
  }
  
  if (params.address && params.address.trim()) {
    query = query.ilike('address', `%${params.address.trim()}%`);
  }
  
  if (params.city && params.city.trim()) {
    query = query.ilike('city', `%${params.city.trim()}%`);
  }
  
  if (params.state && params.state.trim()) {
    query = query.ilike('state', `%${params.state.trim()}%`);
  }
  
  if (params.zipCode && params.zipCode.trim()) {
    query = query.ilike('zipcode', `%${params.zipCode.trim()}%`);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error searching for customers:", error);
    throw error;
  }
  
  return data;
};

