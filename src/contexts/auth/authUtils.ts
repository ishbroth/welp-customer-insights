
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch user profile from database with fresh data
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    console.log("Fetching fresh user profile for userId:", userId);
    
    // Always fetch fresh data from the database, no caching
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zipcode,
        type,
        bio,
        business_id,
        avatar,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!profile) {
      console.log("No profile found for userId:", userId);
      return null;
    }

    console.log("Fresh profile data fetched from database:", profile);

    // Validate and clean profile data
    const cleanedProfile = {
      id: profile.id,
      name: profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zipCode: profile.zipcode || '', // Note: database uses 'zipcode', User type uses 'zipCode'
      type: (profile.type as "business" | "customer" | "admin") || "customer",
      bio: profile.bio || '',
      businessId: profile.business_id || '',
      avatar: profile.avatar || ''
    };

    // Additional validation
    if (cleanedProfile.type === 'business' && !cleanedProfile.name) {
      console.warn("Business profile missing name, this may cause issues");
    }

    console.log("Cleaned and validated user profile:", cleanedProfile);
    return cleanedProfile;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
};

/**
 * Force refresh user profile from database (no caching)
 */
export const refreshUserProfile = async (userId: string): Promise<User | null> => {
  console.log("Force refreshing user profile for userId:", userId);
  // This function is identical to fetchUserProfile but semantically different
  // It's used when we explicitly want to bypass any potential caching
  return fetchUserProfile(userId);
};

/**
 * Load one-time access resources for a user
 */
export const loadOneTimeAccessResources = async (userId: string): Promise<string[]> => {
  try {
    console.log("Loading one-time access resources for userId:", userId);
    
    const { data, error } = await supabase
      .from('customer_access')
      .select('customer_id')
      .eq('business_id', userId)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error("Error loading one-time access resources:", error);
      return [];
    }

    const resources = data?.map(item => item.customer_id) || [];
    console.log("Loaded one-time access resources:", resources);
    return resources;
  } catch (error) {
    console.error("Error in loadOneTimeAccessResources:", error);
    return [];
  }
};

/**
 * Validate profile data integrity
 */
export const validateProfileData = (profile: Partial<User>): string[] => {
  const errors: string[] = [];

  if (profile.email && !profile.email.includes('@')) {
    errors.push("Invalid email format");
  }

  if (profile.phone && profile.phone.replace(/\D/g, '').length < 10) {
    errors.push("Phone number must be at least 10 digits");
  }

  if (profile.type === 'business' && (!profile.name || profile.name.trim().length === 0)) {
    errors.push("Business name is required for business accounts");
  }

  if (profile.zipCode && !/^\d{5}(-\d{4})?$/.test(profile.zipCode)) {
    errors.push("Invalid ZIP code format");
  }

  return errors;
};
