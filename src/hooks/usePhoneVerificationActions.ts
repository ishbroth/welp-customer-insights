
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { resendVerificationCode } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('usePhoneVerificationActions');

interface UsePhoneVerificationActionsProps {
  email: string | null;
  password: string | null;
  name: string | null;
  phoneNumber: string | null;
  accountType: string | null;
  businessName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  setIsCodeValid: (valid: boolean) => void;
  setIsVerifying: (verifying: boolean) => void;
  setIsResending: (resending: boolean) => void;
  startTimer: () => void;
}

export const usePhoneVerificationActions = ({
  email,
  password,
  name,
  phoneNumber,
  accountType,
  businessName,
  address,
  city,
  state,
  zipCode,
  setIsCodeValid,
  setIsVerifying,
  setIsResending,
  startTimer
}: UsePhoneVerificationActionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVerifyCode = async (verificationCode: string) => {
    if (!phoneNumber || !verificationCode || !email || !password) {
      toast({
        title: "Error",
        description: "Missing required information for verification.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Split name into first and last name
      const nameParts = (name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Prepare user data for account creation
      const userData = {
        email,
        password,
        name,
        firstName,
        lastName,
        phone: phoneNumber,
        address,
        city,
        state,
        zipCode,
        accountType,
        businessName
      };

      // Verify the code and create account using the new edge function
      const { data, error } = await supabase.functions.invoke('verify-phone-code', {
        body: {
          phoneNumber,
          code: verificationCode,
          userData
        }
      });
      
      if (error) {
        hookLogger.error("Error verifying phone code:", error);
        throw new Error(error.message);
      }

      if (data.success && data.isValid) {
        hookLogger.info("Phone verified and account created successfully");

        // Show success toast
        toast({
          title: "Account Created Successfully!",
          description: accountType === 'customer' 
            ? "Your account has been created and verified. You can now log in." 
            : "Your phone number has been verified. Now let's set up your password.",
        });
        
        // Redirect based on account type
        if (accountType === 'business') {
          navigate('/business-password-setup', {
            state: {
              businessEmail: email,
              phone: phoneNumber,
              businessName,
              address,
              city,
              state,
              zipCode
            }
          });
        } else {
          // For customer accounts, they should now be automatically signed in
          if (data.session && data.user) {
            hookLogger.info("User automatically signed in, redirecting to profile");
            navigate("/profile");
          } else if (data.autoSignInFailed) {
            // Account was created but auto sign-in failed, redirect to login
            navigate("/login", {
              state: {
                message: "Account created successfully! Please log in with your credentials.",
                email: email
              }
            });
          } else {
            // Fallback to login page
            navigate("/login", {
              state: {
                message: "Account created successfully! Please log in with your credentials.",
                email: email
              }
            });
          }
        }
      } else {
        setIsCodeValid(false);
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      hookLogger.error("Verification error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!phoneNumber) return;
    
    setIsResending(true);
    
    try {
      const { success, error } = await resendVerificationCode({ 
        phoneNumber
      });
      
      if (success) {
        startTimer();
        toast({
          title: "Code Resent",
          description: `A new verification code has been sent to ${phoneNumber}.`,
        });
      } else {
        toast({
          title: "Error",
          description: error || "Failed to resend verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      hookLogger.error("Error resending code:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return {
    handleVerifyCode,
    handleResendCode
  };
};
