
import { supabase } from "@/integrations/supabase/client";
import type { BusinessInfo, BusinessInfoInsert } from "@/types/supabase";

/**
 * Get a business profile with business info by ID
 * @param userId The ID of the business user
 * @param requestingUserType Optional parameter indicating the type of user making the request
 */
export const getBusinessProfile = async (userId: string, requestingUserType?: string) => {
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
  
  // If the requesting user is a customer, remove the address information
  if (requestingUserType === 'customer') {
    return {
      ...profile,
      address: undefined, // Remove address for customers
      business_name: businessInfo.business_name,
      license_number: businessInfo.license_number,
      verified: businessInfo.verified,
    };
  }
  
  // Return full information for other user types (business owners, admins)
  return {
    ...profile,
    business_name: businessInfo.business_name,
    license_number: businessInfo.license_number,
    verified: businessInfo.verified,
  };
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
 * Verify a business license/EIN using external API
 * This integrates with our Supabase edge function
 */
export const verifyBusinessLicense = async (licenseData: {
  licenseNumber: string;
  businessName: string;
  state?: string;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-business-license', {
      body: JSON.stringify(licenseData)
    });
    
    if (error) throw error;
    
    return {
      verified: data.verified,
      license_number: data.licenseNumber,
      license_type: data.licenseType,
      license_status: data.licenseStatus,
      license_expiration: data.licenseExpiration,
      business_name: data.businessName
    };
  } catch (error) {
    console.error("Error verifying business license:", error);
    throw new Error("License verification failed. Please try again later.");
  }
};
