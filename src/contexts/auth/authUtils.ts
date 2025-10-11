
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const authLogger = logger.withContext('AuthUtils');

/**
 * Fetch user profile from database with fresh data
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    authLogger.debug("Fetching fresh user profile for userId:", userId);
    
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
      authLogger.error("Error fetching user profile:", error);
      return null;
    }

    if (!profile) {
      authLogger.debug("No profile found for userId:", userId);
      return null;
    }

    authLogger.debug("Fresh profile data fetched from database:", profile);

    // Transform database profile to User type
    const user: User = {
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

    authLogger.debug("Transformed user profile:", user);
    return user;
  } catch (error) {
    authLogger.error("Error in fetchUserProfile:", error);
    return null;
  }
};

/**
 * Force refresh user profile from database (no caching)
 */
export const refreshUserProfile = async (userId: string): Promise<User | null> => {
  authLogger.debug("Force refreshing user profile for userId:", userId);
  // This function is identical to fetchUserProfile but semantically different
  // It's used when we explicitly want to bypass any potential caching
  return fetchUserProfile(userId);
};

/**
 * Load one-time access resources for a user
 */
export const loadOneTimeAccessResources = async (userId: string): Promise<string[]> => {
  try {
    authLogger.debug("Loading one-time access resources for userId:", userId);

    const { data, error } = await supabase
      .from('customer_access')
      .select('customer_id')
      .eq('business_id', userId)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      authLogger.error("Error loading one-time access resources:", error);
      return [];
    }

    const resources = data?.map(item => item.customer_id) || [];
    authLogger.debug("Loaded one-time access resources:", resources);
    return resources;
  } catch (error) {
    authLogger.error("Error in loadOneTimeAccessResources:", error);
    return [];
  }
};
