
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Fetch user profile from the database
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    console.log("Fetching profile for user ID:", userId);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!profile) {
      console.log("No profile found for user ID:", userId);
      return null;
    }

    console.log("Raw profile data from database:", profile);

    // Transform database profile to User type
    const user: User = {
      id: profile.id,
      email: profile.email || '',
      name: profile.name || '',
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zipCode: profile.zipcode || '', // Note: database column is 'zipcode'
      type: profile.type || 'customer',
      bio: profile.bio || '',
      businessId: profile.business_id || '',
      avatar: profile.avatar || ''
    };

    console.log("Transformed user object:", user);
    return user;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
};

/**
 * Load one-time access resources for a user
 */
export const loadOneTimeAccessResources = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_access')
      .select('business_id')
      .eq('customer_id', userId)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error("Error loading one-time access resources:", error);
      return [];
    }

    return data?.map(item => item.business_id) || [];
  } catch (error) {
    console.error("Error in loadOneTimeAccessResources:", error);
    return [];
  }
};
