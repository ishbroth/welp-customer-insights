
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling login-related functionality
 */
export const useAuthLogin = () => {
  // Login function using Supabase
  const login = async (email: string, password: string) => {
    try {
      // First attempt a regular login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // If login failed due to unconfirmed email, handle it separately
      if (error && error.message === "Email not confirmed") {
        console.log("Email not confirmed, attempting to confirm and login");
        
        // Use the functions invoke method instead of admin.listUsers which requires admin privileges
        try {
          // Try to confirm the email directly
          await supabase.functions.invoke('confirm-email', {
            body: { email }
          });
          
          // Try login again
          const { data: confirmedData, error: confirmedError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
          
          if (confirmedError) {
            console.error("Login error after email confirmation:", confirmedError);
            return { success: false, error: confirmedError.message };
          }
          
          // Session and user will be set by the auth state listener
          return { success: true };
        } catch (confirmError) {
          console.error("Error confirming email:", confirmError);
          return { success: false, error: "Unable to verify account. Please contact support." };
        }
      }
      
      if (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      }

      // Session and user will be set by the auth state listener
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  return { login };
};
