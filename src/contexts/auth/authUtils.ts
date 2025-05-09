
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Fetches user profile data from the profiles table
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (data) {
      // Map the database profile to our application User type
      const user: User = {
        id: data.id,
        email: data.email || '',
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipcode || '', // Note: Maps from DB field 'zipcode'
        type: data.type as "customer" | "business" | "admin",
        avatar: data.avatar || undefined,
      };
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

/**
 * Checks if a user has an active subscription
 */
export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

/**
 * Loads one-time access resources for a user
 */
export const loadOneTimeAccessResources = async (userId: string): Promise<string[]> => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('customer_access')
      .select('customer_id')
      .eq('business_id', userId);
      
    if (error) {
      console.error("Error loading one-time access resources:", error);
      return [];
    }
    
    if (data) {
      return data.map(item => item.customer_id || '').filter(Boolean);
    }
    
    return [];
  } catch (error) {
    console.error("Error loading one-time access:", error);
    return [];
  }
};
