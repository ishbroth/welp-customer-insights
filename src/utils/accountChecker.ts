
import { supabase } from "@/integrations/supabase/client";

export const checkAccountType = async (email: string) => {
  try {
    console.log("Checking account type for email:", email);
    
    // Check profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, type, name')
      .eq('email', email)
      .maybeSingle();
    
    console.log("Profile data:", profileData);
    console.log("Profile error:", profileError);
    
    if (profileData) {
      console.log(`Account type for ${email}: ${profileData.type}`);
      return {
        exists: true,
        type: profileData.type,
        name: profileData.name,
        id: profileData.id
      };
    }
    
    // Check auth.users table via edge function or other method
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    console.log("Auth users check:", { authUsers, authError });
    
    if (authUsers?.users) {
      const userInAuth = authUsers.users.find(user => 
        user.email?.toLowerCase() === email.toLowerCase()
      );
      
      if (userInAuth) {
        console.log("Found user in auth.users:", userInAuth);
        return {
          exists: true,
          type: userInAuth.user_metadata?.type || 'unknown',
          name: userInAuth.user_metadata?.name || 'Unknown',
          id: userInAuth.id,
          inAuthOnly: true
        };
      }
    }
    
    return {
      exists: false,
      type: null,
      name: null,
      id: null
    };
    
  } catch (error) {
    console.error("Error checking account type:", error);
    return {
      exists: false,
      type: null,
      name: null,
      id: null,
      error: error.message
    };
  }
};

// Call this function and log the result
checkAccountType("Iw@sdcarealty.com").then(result => {
  console.log("Account check result:", result);
});
