
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling logout functionality
 */
export const useLogout = (setIsSubscribed: (value: boolean) => void) => {
  // Logout function
  const logout = async () => {
    console.log("Logging out user...");
    
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
    
    console.log("User logged out successfully");
  };

  return { logout };
};
