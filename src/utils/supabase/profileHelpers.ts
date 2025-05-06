
import { supabase } from "@/integrations/supabase/client";
import type { Profile, ProfileInsert } from "@/types/supabase";

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
