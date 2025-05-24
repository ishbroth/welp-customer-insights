
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch user profile from database
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    console.log("Fetching user profile for:", userId);
    
    // Special handling for business admin account
    if (userId === "10000000-0000-0000-0000-000000000001") {
      // Update the profile name in the database first
      await supabase
        .from('profiles')
        .update({ name: 'The Painted Painter' })
        .eq('id', userId);
      
      // Update business_info as well
      await supabase
        .from('business_info')
        .update({ business_name: 'The Painted Painter' })
        .eq('id', userId);
      
      // Update any existing reviews where this business is the reviewer
      await supabase
        .from('reviews')
        .update({ 
          customer_name: 'The Painted Painter' // This field stores the business name when business reviews customer
        })
        .eq('business_id', userId);
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    if (!data) {
      console.log("No profile found for user:", userId);
      return null;
    }

    console.log("Profile data fetched:", data);

    // Map the profile data to User type
    const userProfile: User = {
      id: data.id,
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.zipcode || '',
      avatar: data.avatar || '',
      bio: data.bio || '',
      type: data.type as 'business' | 'customer' | 'admin',
      businessId: data.business_id || '',
    };

    return userProfile;
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
    // This would fetch one-time access purchases from the database
    // For now, return empty array
    return [];
  } catch (error) {
    console.error("Error loading one-time access resources:", error);
    return [];
  }
};
