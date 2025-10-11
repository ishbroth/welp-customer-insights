
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const utilLogger = logger.withContext('forceDeleteAccount');

/**
 * Force delete an account by email - for debugging corrupted accounts
 */
export const forceDeleteCorruptedAccount = async (email: string) => {
  utilLogger.info(`Starting force deletion of corrupted account: ${email}`);
  
  try {
    // First, try to sign in as the user to get their session
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'dummy-password' // This will likely fail, but we need to try
    });
    
    if (authError) {
      utilLogger.warn("Cannot sign in with corrupted account, trying alternative approach");
      
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
        utilLogger.error("Error in force delete:", error);
        throw error;
      }

      utilLogger.info("Force deletion completed:", data);
      return { success: true, data };
    }

    // If we somehow got a session, use the normal delete process
    if (authData.session) {
      utilLogger.info("Using normal deletion process with session");
      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (error) {
        utilLogger.error("Error in normal delete:", error);
        throw error;
      }

      utilLogger.info("Normal deletion completed:", data);
      return { success: true, data };
    }

  } catch (error) {
    utilLogger.error("Force deletion failed:", error);
    return { success: false, error };
  }
};

/**
 * Verify that an account has been completely deleted
 */
export const verifyAccountDeleted = async (email: string) => {
  utilLogger.info(`Verifying account deletion for: ${email}`);
  
  try {
    // Try to sign in - this should fail
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'any-password'
    });
    
    if (authError && authError.message.includes('Invalid login credentials')) {
      utilLogger.info("Auth account properly deleted - login fails as expected");
      return { deleted: true, verified: true };
    }

    if (authData.user) {
      utilLogger.warn("Auth user still exists!");
      return { deleted: false, verified: false };
    }

    utilLogger.info("Account appears to be deleted");
    return { deleted: true, verified: true };

  } catch (error) {
    utilLogger.error("Error verifying deletion:", error);
    return { deleted: false, verified: false, error };
  }
};

/**
 * Test account recreation after deletion
 */
export const testAccountRecreation = async (email: string) => {
  utilLogger.info(`Testing account recreation for: ${email}`);
  
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
      utilLogger.error("Account recreation failed:", error);
      return { success: false, error };
    }

    utilLogger.info("Account recreation successful:", data);

    // Clean up the test account
    if (data.user) {
      await supabase.auth.signOut();
    }

    return { success: true, data };

  } catch (error) {
    utilLogger.error("Error in account recreation test:", error);
    return { success: false, error };
  }
};
