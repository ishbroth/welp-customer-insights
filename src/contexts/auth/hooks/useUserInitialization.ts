
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { logger } from '@/utils/logger';

const authLogger = logger.withContext('UserInitialization');

/**
 * Hook for initializing user data and profile information
 */
export const useUserInitialization = () => {
  const initUserData = async (userId: string, forceRefresh: boolean = false) => {
    authLogger.debug("Initializing user data for:", userId);
    
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        authLogger.error("Error fetching profile:", profileError);
        return { userProfile: null, accessResources: [] };
      }

      // Fetch business info if user is a business type
      let businessInfo = null;
      if (profile?.type === 'business' || profile?.type === 'admin') {
        const { data: businessData, error: businessError } = await supabase
          .from('business_info')
          .select('*')
          .eq('id', userId)
          .single();

        if (!businessError && businessData) {
          businessInfo = businessData;
        }
      }

      // Create user object
      const userProfile: User = {
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        type: profile.type as 'customer' | 'business' | 'admin',
        avatar: profile.avatar,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipcode,
        firstName: profile.first_name,
        lastName: profile.last_name,
        bio: profile.bio,
        businessId: profile.business_id,
        businessInfo: businessInfo ? {
          business_name: businessInfo.business_name,
          business_category: businessInfo.business_category,
          business_subcategory: businessInfo.business_subcategory,
          license_number: businessInfo.license_number,
          license_type: businessInfo.license_type,
          license_state: businessInfo.license_state,
          license_status: businessInfo.license_status,
          license_expiration: businessInfo.license_expiration,
          website: businessInfo.website,
          additional_info: businessInfo.additional_info,
          additional_licenses: businessInfo.additional_licenses,
          verified: businessInfo.verified
        } : undefined
      };

      // Fetch one-time access resources
      const { data: accessData, error: accessError } = await supabase
        .from('guest_access')
        .select('review_id')
        .eq('access_token', userId);

      const accessResources = accessError ? [] : (accessData?.map(item => item.review_id) || []);

      authLogger.info("User data initialized:", userProfile);
      return { userProfile, accessResources };

    } catch (error) {
      authLogger.error("Error in initUserData:", error);
      return { userProfile: null, accessResources: [] };
    }
  };

  return { initUserData };
};
