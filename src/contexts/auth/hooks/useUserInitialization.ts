
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
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If profile doesn't exist (PGRST116), create it from auth user data
      if (profileError && profileError.code === 'PGRST116') {
        authLogger.warn("Profile not found, creating from auth user data:", userId);

        // Get auth user data
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          authLogger.error("Error fetching auth user:", authError);
          return { userProfile: null, accessResources: [] };
        }

        // Extract user metadata
        const userMetadata = authUser.user_metadata || {};
        const accountType = userMetadata.account_type || 'customer';

        // Create profile from auth data
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          name: userMetadata.name || userMetadata.business_name || '',
          type: accountType,
          phone: userMetadata.phone || '',
          address: userMetadata.address || '',
          city: userMetadata.city || '',
          state: userMetadata.state || '',
          zipcode: userMetadata.zipcode || userMetadata.zip_code || '',
          first_name: userMetadata.first_name || '',
          last_name: userMetadata.last_name || '',
          avatar: userMetadata.avatar || null,
          bio: userMetadata.bio || null,
          business_id: userMetadata.business_id || null,
        };

        authLogger.info("Creating new profile:", newProfile);

        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (insertError) {
          authLogger.error("Error creating profile:", insertError);
          return { userProfile: null, accessResources: [] };
        }

        profile = insertedProfile;
        authLogger.info("Profile created successfully:", profile);
      } else if (profileError) {
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
