
import { supabase } from "@/integrations/supabase/client";

export const useCustomerEmailValidation = (setExistingEmailError: (value: boolean) => void) => {
  // Email validation to check if it's already registered
  const checkEmailExists = async (email: string) => {
    try {
      // Check if the email already exists in auth
      const { error, data } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      
      // If there's no error when trying to send a one-time password to the email,
      // it means the email exists
      if (!error) {
        setExistingEmailError(true);
        return true;
      }
      
      // If error contains "Email not confirmed" or "Invalid login credentials", 
      // it means the email exists but password is wrong
      if (error.message.includes("Email not confirmed") || 
          error.message.includes("Invalid login credentials")) {
        setExistingEmailError(true);
        return true;
      }
      
      setExistingEmailError(false);
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  return { checkEmailExists };
};
