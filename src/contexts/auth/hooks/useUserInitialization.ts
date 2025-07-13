
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Hook for initializing user data
 */
export const useUserInitialization = () => {
  const initUserData = async (userId: string, forceRefresh: boolean = false) => {
    try {
      console.log("🔄 Initializing user data for:", userId, "Force refresh:", forceRefresh);
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zipcode,
          type,
          avatar,
          bio,
          verified,
          business_id,
          first_name,
          last_name
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("❌ Error fetching profile:", profileError);
        return { userProfile: null, accessResources: [] };
      }

      if (!profile) {
        console.log("❌ No profile found for user:", userId);
        return { userProfile: null, accessResources: [] };
      }

      console.log("✅ Profile found:", profile);

      let licenseType = '';
      let businessVerified = false;

      // If user is a business, fetch business info
      if (profile.type === 'business') {
        const { data: businessInfo, error: businessError } = await supabase
          .from('business_info')
          .select('license_type, verified')
          .eq('id', userId)
          .single();

        if (!businessError && businessInfo) {
          licenseType = businessInfo.license_type || '';
          businessVerified = businessInfo.verified || false;
          console.log("📋 Business info:", { licenseType, businessVerified });
        }
      }

      // Fetch one-time access resources
      const { data: accessData, error: accessError } = await supabase
        .from('guest_access')
        .select('review_id')
        .eq('access_token', `user_${userId}`)
        .gt('expires_at', new Date().toISOString());

      const accessResources = accessError ? [] : (accessData?.map(item => item.review_id) || []);

      const userProfile: User = {
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipcode || '',
        type: profile.type as 'customer' | 'business' | 'admin',
        avatar: profile.avatar || '',
        bio: profile.bio || '',
        verified: profile.verified || businessVerified,
        businessId: profile.business_id || '',
        licenseType: licenseType,
        firstName: profile.first_name || '',
        lastName: profile.last_name || ''
      };

      console.log("🎉 User profile initialized:", userProfile);
      return { userProfile, accessResources };

    } catch (error) {
      console.error("❌ Error in initUserData:", error);
      return { userProfile: null, accessResources: [] };
    }
  };

  return { initUserData };
};
