
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling logout functionality
 */
export const useLogout = (setIsSubscribed: (value: boolean) => void) => {
  // Enhanced logout function that clears all auth state
  const logout = async () => {
    console.log("Performing complete logout and clearing all auth state");
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear subscription state
    setIsSubscribed(false);
    
    // Clear any residual auth tokens from localStorage
    try {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-yftvcixhifvrovwhtgtj-auth-token');
      // Clear any other potential auth-related items
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
    
    console.log("Logout complete - all auth state cleared");
  };

  return { logout };
};
