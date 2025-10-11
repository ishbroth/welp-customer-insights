
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const authLogger = logger.withContext('Logout');

/**
 * Hook for handling logout functionality
 */
export const useLogout = (setIsSubscribed: (value: boolean) => void) => {
  // Logout function
  const logout = async () => {
    authLogger.debug("Logging out user...");

    // Clear any stored session data
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Reset subscription status
    setIsSubscribed(false);

    // Clear any mock user data
    if (window.__CURRENT_USER__) {
      delete window.__CURRENT_USER__;
    }

    authLogger.info("User logged out successfully");
  };

  return { logout };
};
