
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling logout functionality
 */
export const useLogout = (setIsSubscribed: (value: boolean) => void) => {
  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setIsSubscribed(false);
  };

  return { logout };
};
