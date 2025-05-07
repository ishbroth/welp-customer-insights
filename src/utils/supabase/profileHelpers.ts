
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
  // Check if profile exists first
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
    
    return data;
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
    
    return data;
  }
};

/**
 * Search for users by different criteria
 */
export const searchUsers = async (searchParams: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}) => {
  let query = supabase
    .from('profiles')
    .select('*');
  
  if (searchParams.firstName) {
    query = query.ilike('first_name', `%${searchParams.firstName}%`);
  }
  
  if (searchParams.lastName) {
    query = query.ilike('last_name', `%${searchParams.lastName}%`);
  }
  
  if (searchParams.email) {
    query = query.ilike('email', `%${searchParams.email}%`);
  }
  
  if (searchParams.phone) {
    query = query.ilike('phone', `%${searchParams.phone}%`);
  }
  
  if (searchParams.address) {
    query = query.ilike('address', `%${searchParams.address}%`);
  }
  
  if (searchParams.city) {
    query = query.ilike('city', `%${searchParams.city}%`);
  }
  
  if (searchParams.state) {
    query = query.ilike('state', `%${searchParams.state}%`);
  }
  
  if (searchParams.zipCode) {
    query = query.ilike('zipcode', `%${searchParams.zipCode}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error searching users:", error);
    throw error;
  }
  
  return data || [];
};
