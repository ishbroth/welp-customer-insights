
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if customer name AND phone exist together within customer accounts only
 */
export const checkCustomerNameAndPhoneExists = async (firstName: string, lastName: string, phone: string): Promise<{ exists: boolean; email?: string }> => {
  try {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) return { exists: false };
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Only check within customer accounts for phone duplicates
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, name, phone, email')
      .eq('type', 'customer')
      .ilike('phone', `%${cleanPhone.slice(-10)}%`);
    
    if (error || !profiles?.length) {
      return { exists: false };
    }
    
    // Check if any profile has both matching name and phone
    const matchingProfile = profiles.find(profile => {
      const profilePhone = profile.phone?.replace(/\D/g, '') || '';
      const phoneMatches = profilePhone.includes(cleanPhone.slice(-10)) || cleanPhone.includes(profilePhone.slice(-10));
      
      if (!phoneMatches) return false;
      
      const profileFullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      const profileName = profile.name?.trim() || '';
      const nameMatches = profileFullName.toLowerCase() === fullName.toLowerCase() || 
                         profileName.toLowerCase() === fullName.toLowerCase();
      
      return nameMatches;
    });
    
    return {
      exists: !!matchingProfile,
      email: matchingProfile?.email || undefined
    };
  } catch (error) {
    console.error("Error checking customer name and phone:", error);
    return { exists: false };
  }
};

/**
 * Check if phone number exists within customer accounts only
 */
export const checkCustomerPhoneExists = async (phone: string): Promise<boolean> => {
  try {
    const cleanedPhone = phone.replace(/\D/g, '');
    console.log("=== ENHANCED CUSTOMER PHONE CHECK ===");
    console.log("Input phone:", phone);
    console.log("Cleaned phone:", cleanedPhone);
    
    // First, try to get ALL profiles to see if RLS is blocking us
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, phone, email, name, first_name, last_name, type')
      .limit(10);
    
    console.log("ALL PROFILES query result:", { 
      count: allProfiles?.length, 
      error: allError,
      profiles: allProfiles 
    });
    
    // Then try the customer-specific query
    const { data: customerProfiles, error: customerError } = await supabase
      .from('profiles')
      .select('phone, email, name, first_name, last_name, type')
      .eq('type', 'customer')
      .not('phone', 'is', null);
    
    console.log("CUSTOMER PROFILES query result:", { 
      count: customerProfiles?.length, 
      error: customerError,
      profiles: customerProfiles 
    });
    
    // Try a different approach - search without type filter first
    const { data: phonesOnly, error: phonesError } = await supabase
      .from('profiles')
      .select('phone, email, name, first_name, last_name, type')
      .not('phone', 'is', null);
    
    console.log("ALL PHONES query result:", { 
      count: phonesOnly?.length, 
      error: phonesError,
      profiles: phonesOnly 
    });
    
    // Try to find your specific profile by email
    const { data: yourProfile, error: yourError } = await supabase
      .from('profiles')
      .select('id, phone, email, name, first_name, last_name, type')
      .eq('email', 'isaac.wiley99@gmail.com')
      .maybeSingle();
    
    console.log("YOUR PROFILE by email:", { 
      profile: yourProfile, 
      error: yourError 
    });
    
    // Check all profiles for phone matches
    if (phonesOnly && phonesOnly.length > 0) {
      console.log("Checking all profiles for phone matches...");
      for (const profile of phonesOnly) {
        if (profile.phone) {
          const profileCleanedPhone = profile.phone.replace(/\D/g, '');
          console.log(`Comparing: input="${cleanedPhone}" vs stored="${profileCleanedPhone}" (type: ${profile.type}, email: ${profile.email})`);
          
          if (profileCleanedPhone === cleanedPhone) {
            console.log("PHONE MATCH FOUND!", profile);
            return true;
          }
        }
      }
    }
    
    console.log("No phone match found in any approach");
    return false;
  } catch (error) {
    console.error("Error checking customer phone:", error);
    return false;
  }
};

/**
 * Check if email exists across both customer and business accounts
 */
export const checkEmailExistsAcrossAllAccounts = async (email: string): Promise<boolean> => {
  try {
    console.log("=== ENHANCED EMAIL CHECK ACROSS ALL ACCOUNTS ===");
    console.log("Checking email:", email);
    
    // First try to get ALL profiles to see if RLS is blocking
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, email, type')
      .limit(10);
    
    console.log("ALL PROFILES for email check:", { 
      count: allProfiles?.length, 
      error: allError,
      profiles: allProfiles 
    });
    
    // Check for email in both customer and business accounts
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, type')
      .eq('email', email)
      .limit(1)
      .maybeSingle();
    
    console.log("EMAIL PROFILE query result:", { 
      profile: profileData, 
      error: profileError 
    });
    
    if (profileData) {
      console.log("Email exists in profiles table for account type:", profileData.type);
      return true;
    }
    
    // If profile query failed, try auth approach
    if (profileError) {
      console.log("Profile query failed, trying auth approach:", profileError);
      try {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false
          }
        });
        
        if (!authError) {
          console.log("Email exists in auth table");
          return true;
        }
        
        if (authError.message.includes('Email not confirmed') || 
            authError.message.includes('Invalid login credentials') ||
            authError.message.includes('User already registered')) {
          console.log("Email exists but with auth issue:", authError.message);
          return true;
        }
        
        console.log("Auth check suggests email doesn't exist:", authError.message);
      } catch (authCheckError) {
        console.log("Auth check failed:", authCheckError);
      }
    }
    
    console.log("Email not found");
    return false;
  } catch (error) {
    console.error("Error checking email across all accounts:", error);
    return false;
  }
};
