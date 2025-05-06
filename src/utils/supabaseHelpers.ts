
import { supabase } from "@/integrations/supabase/client";
import { 
  SearchParams,
  UserWithProfile,
  BusinessWithInfo
} from "@/types/supabase";

/**
 * Search for customer profiles based on search parameters
 */
export const searchCustomers = async (params: SearchParams) => {
  let query = supabase
    .from('profiles')
    .select('*, business_info(*)')
    .eq('type', 'customer');

  // Add filter conditions based on provided parameters
  if (params.firstName) {
    query = query.ilike('first_name', `%${params.firstName}%`);
  }
  
  if (params.lastName) {
    query = query.ilike('last_name', `%${params.lastName}%`);
  }
  
  if (params.phone) {
    query = query.ilike('phone', `%${params.phone}%`);
  }
  
  if (params.address) {
    query = query.ilike('address', `%${params.address}%`);
  }
  
  if (params.city) {
    query = query.ilike('city', `%${params.city}%`);
  }
  
  if (params.state) {
    query = query.eq('state', params.state);
  }
  
  if (params.zipCode) {
    query = query.eq('zipcode', params.zipCode);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Get the current user profile with additional information
 */
export const getCurrentUserProfile = async (): Promise<UserWithProfile | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session?.user) {
    return null;
  }
  
  const userId = sessionData.session.user.id;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  return {
    id: data.id,
    email: sessionData.session.user.email,
    type: data.type as 'business' | 'customer',
    first_name: data.first_name || undefined,
    last_name: data.last_name || undefined,
    phone: data.phone || undefined,
    address: data.address || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    zipcode: data.zipcode || undefined
  };
};

/**
 * Get a business profile with business info
 */
export const getBusinessProfile = async (businessId: string): Promise<BusinessWithInfo | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      business_info(*)
    `)
    .eq('id', businessId)
    .eq('type', 'business')
    .maybeSingle();
  
  if (error) {
    console.error('Error getting business profile:', error);
    throw error;
  }
  
  if (!data || !data.business_info) {
    return null;
  }
  
  return {
    id: data.id,
    type: 'business',
    first_name: data.first_name || undefined,
    last_name: data.last_name || undefined,
    phone: data.phone || undefined,
    address: data.address || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    zipcode: data.zipcode || undefined,
    business_name: data.business_info.business_name,
    license_number: data.business_info.license_number || undefined,
    verified: data.business_info.verified
  };
};

/**
 * Verify a business with license information
 */
export const verifyBusiness = async (businessId: string, licenseData: {
  licenseNumber: string;
  businessName: string;
  licenseType?: string;
  licenseStatus?: string;
  licenseExpiration?: string;
}): Promise<boolean> => {
  const { error } = await supabase
    .from('business_info')
    .update({
      license_number: licenseData.licenseNumber,
      license_type: licenseData.licenseType || 'Business License',
      license_status: licenseData.licenseStatus || 'Active',
      license_expiration: licenseData.licenseExpiration ? new Date(licenseData.licenseExpiration).toISOString() : null,
      verified: true
    })
    .eq('id', businessId);
  
  if (error) {
    console.error('Error verifying business:', error);
    throw error;
  }
  
  return true;
};
