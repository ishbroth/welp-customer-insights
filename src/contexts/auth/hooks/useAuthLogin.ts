
import { supabase } from "@/integrations/supabase/client";

// Define the return type for login function
interface LoginResult {
  success: boolean;
  error?: string;
  needsPhoneVerification?: boolean;
  needsPasswordSetup?: boolean;
  phone?: string;
  verificationData?: any;
}

/**
 * Hook for handling login-related functionality
 */
export const useAuthLogin = () => {
  // Check if user needs phone verification
  const checkPhoneVerificationStatus = async (userId: string) => {
    try {
      console.log("🔍 Checking phone verification status for user:", userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('phone, type, verified')
        .eq('id', userId)
        .single();

      console.log("📋 Profile data:", { profile, error });

      if (error) {
        console.error("Error checking profile:", error);
        return { needsPhoneVerification: false };
      }

      // If user has a phone but is not verified, they need phone verification
      if (profile?.phone && !profile?.verified) {
        console.log("🚨 User has phone but is not verified - needs phone verification");
        console.log("📱 Phone:", profile.phone);
        console.log("✅ Verified status:", profile.verified);
        return { 
          needsPhoneVerification: true, 
          phone: profile.phone,
          accountType: profile.type
        };
      }

      console.log("✅ User verification check passed - no phone verification needed");
      return { needsPhoneVerification: false };
    } catch (error) {
      console.error("Error in phone verification check:", error);
      return { needsPhoneVerification: false };
    }
  };

  // Login function using Supabase (email/password only)
  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      console.log("🔐 Attempting login for:", email);
      
      // First attempt a regular login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // If login failed due to unconfirmed email, handle it separately
      if (error && error.message === "Email not confirmed") {
        console.log("📧 Email not confirmed, attempting to confirm and login");
        
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
            console.error("❌ Login error after email confirmation:", confirmedError);
            return { success: false, error: confirmedError.message };
          }
          
          // Check phone verification status
          const phoneCheck = await checkPhoneVerificationStatus(confirmedData.user.id);
          if (phoneCheck.needsPhoneVerification) {
            console.log("🔄 Phone verification needed after email confirmation");
            return { 
              success: true, 
              needsPhoneVerification: true,
              phone: phoneCheck.phone,
              verificationData: { accountType: phoneCheck.accountType }
            };
          }
          
          return { success: true };
        } catch (confirmError) {
          console.error("❌ Error confirming email:", confirmError);
          return { success: false, error: "Unable to verify account. Please contact support." };
        }
      }
      
      // Check if this is a "user not found" error, which might indicate incomplete registration
      if (error && error.message === "Invalid login credentials") {
        console.log("🔍 Invalid login credentials - checking if user exists but needs password setup");
        
        // Check if a user exists with this email but might need password setup
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, type, phone')
            .eq('email', email)
            .single();
          
          if (profile && !profileError) {
            console.log("👤 User profile found but login failed - likely needs password setup");
            return { 
              success: false, 
              needsPasswordSetup: true,
              error: "Account found but password not set. Please complete your registration by setting up your password.",
              phone: profile.phone
            };
          }
        } catch (profileCheckError) {
          console.error("❌ Error checking profile for incomplete registration:", profileCheckError);
        }
      }
      
      if (error) {
        console.error("❌ Login error:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ Login successful, checking verification status for user:", data.user.id);

      // Check phone verification status for successful login
      const phoneCheck = await checkPhoneVerificationStatus(data.user.id);
      console.log("📞 Phone verification check result:", phoneCheck);
      
      if (phoneCheck.needsPhoneVerification) {
        console.log("🔄 Redirecting to phone verification");
        return { 
          success: true, 
          needsPhoneVerification: true,
          phone: phoneCheck.phone,
          verificationData: { accountType: phoneCheck.accountType }
        };
      }

      console.log("🎉 Login complete - no additional verification needed");
      // Session and user will be set by the auth state listener
      return { success: true };
    } catch (error: any) {
      console.error("❌ Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  return { login };
};
