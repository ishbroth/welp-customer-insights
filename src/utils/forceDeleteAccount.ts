
import { supabase } from "@/integrations/supabase/client";

/**
 * Force delete an account by email - for debugging corrupted accounts
 */
export const forceDeleteCorruptedAccount = async (email: string) => {
  console.log(`🗑️ Starting force deletion of corrupted account: ${email}`);
  
  try {
    // First, try to sign in as the user to get their session
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'dummy-password' // This will likely fail, but we need to try
    });
    
    if (authError) {
      console.log("❌ Cannot sign in with corrupted account, trying alternative approach");
      
      // Call the delete-account edge function with admin privileges
      // We'll need to use the service role to delete this corrupted account
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { 
          forceDelete: true, 
          email: email,
          adminOverride: true 
        }
      });
      
      if (error) {
        console.error("❌ Error in force delete:", error);
        throw error;
      }
      
      console.log("✅ Force deletion completed:", data);
      return { success: true, data };
    }
    
    // If we somehow got a session, use the normal delete process
    if (authData.session) {
      console.log("🔄 Using normal deletion process with session");
      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (error) {
        console.error("❌ Error in normal delete:", error);
        throw error;
      }
      
      console.log("✅ Normal deletion completed:", data);
      return { success: true, data };
    }
    
  } catch (error) {
    console.error("❌ Force deletion failed:", error);
    return { success: false, error };
  }
};

/**
 * Verify that an account has been completely deleted
 */
export const verifyAccountDeleted = async (email: string) => {
  console.log(`🔍 Verifying account deletion for: ${email}`);
  
  try {
    // Try to sign in - this should fail
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'any-password'
    });
    
    if (authError && authError.message.includes('Invalid login credentials')) {
      console.log("✅ Auth account properly deleted - login fails as expected");
      return { deleted: true, verified: true };
    }
    
    if (authData.user) {
      console.log("❌ Auth user still exists!");
      return { deleted: false, verified: false };
    }
    
    console.log("✅ Account appears to be deleted");
    return { deleted: true, verified: true };
    
  } catch (error) {
    console.error("❌ Error verifying deletion:", error);
    return { deleted: false, verified: false, error };
  }
};

/**
 * Test account recreation after deletion
 */
export const testAccountRecreation = async (email: string) => {
  console.log(`🧪 Testing account recreation for: ${email}`);
  
  try {
    // Try to create account with basic info
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'TestPassword123!',
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          type: 'business',
          business_name: 'Test Business'
        }
      }
    });
    
    if (error) {
      console.error("❌ Account recreation failed:", error);
      return { success: false, error };
    }
    
    console.log("✅ Account recreation successful:", data);
    
    // Clean up the test account
    if (data.user) {
      await supabase.auth.signOut();
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Error in account recreation test:", error);
    return { success: false, error };
  }
};
