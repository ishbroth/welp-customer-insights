
import { supabase } from "@/integrations/supabase/client";

// Define the return type for login function
interface LoginResult {
  success: boolean;
  error?: string;
  needsPhoneVerification?: boolean;
  phone?: string;
  verificationData?: any;
}

/**
 * Hook for handling login-related functionality
 */
export const useAuthLogin = () => {
  // List of permanent accounts that bypass email verification
  const permanentAccountEmails = [
    'iw@thepaintedpainter.com',
    'isaac.wiley99@gmail.com'
  ];

  // Check if user needs phone verification
  const checkPhoneVerificationStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('phone, type')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error checking profile:", error);
        return { needsPhoneVerification: false };
      }

      // If it's a business account and has a phone but no verification completed
      // Check if there's verification data in session storage
      const verificationData = sessionStorage.getItem("businessVerificationData");
      const hasUncompletedVerification = verificationData && 
        JSON.parse(verificationData).verificationMethod === "phone" && 
        !JSON.parse(verificationData).isFullyVerified;

      if (profile?.type === 'business' && profile?.phone && hasUncompletedVerification) {
        return { 
          needsPhoneVerification: true, 
          phone: profile.phone,
          verificationData: JSON.parse(verificationData)
        };
      }

      return { needsPhoneVerification: false };
    } catch (error) {
      console.error("Error in phone verification check:", error);
      return { needsPhoneVerification: false };
    }
  };

  // Login function using Supabase (email/password only)
  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      // First attempt a regular login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // If login failed due to unconfirmed email, handle it separately
      if (error && error.message === "Email not confirmed") {
        console.log("Email not confirmed, attempting to confirm and login");
        
        // For permanent accounts, bypass email confirmation
        if (permanentAccountEmails.includes(email.toLowerCase())) {
          console.log("Permanent account detected, bypassing email confirmation");
          
          try {
            // Try to confirm the email directly for permanent accounts
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
            
            // Check phone verification status
            const phoneCheck = await checkPhoneVerificationStatus(confirmedData.user.id);
            if (phoneCheck.needsPhoneVerification) {
              return { 
                success: true, 
                needsPhoneVerification: true,
                phone: phoneCheck.phone,
                verificationData: phoneCheck.verificationData
              };
            }
            
            return { success: true };
          } catch (confirmError) {
            console.error("Error confirming email:", confirmError);
            return { success: false, error: "Unable to verify account. Please contact support." };
          }
        } else {
          // For regular accounts, use the standard confirmation process
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
            
            // Check phone verification status
            const phoneCheck = await checkPhoneVerificationStatus(confirmedData.user.id);
            if (phoneCheck.needsPhoneVerification) {
              return { 
                success: true, 
                needsPhoneVerification: true,
                phone: phoneCheck.phone,
                verificationData: phoneCheck.verificationData
              };
            }
            
            return { success: true };
          } catch (confirmError) {
            console.error("Error confirming email:", confirmError);
            return { success: false, error: "Unable to verify account. Please contact support." };
          }
        }
      }
      
      if (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      }

      // Check phone verification status for successful login
      const phoneCheck = await checkPhoneVerificationStatus(data.user.id);
      if (phoneCheck.needsPhoneVerification) {
        return { 
          success: true, 
          needsPhoneVerification: true,
          phone: phoneCheck.phone,
          verificationData: phoneCheck.verificationData
        };
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
