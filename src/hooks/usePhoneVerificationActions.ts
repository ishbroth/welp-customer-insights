
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { verifyPhoneNumber, resendVerificationCode } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
      // Verify the code
      const { isValid, error } = await verifyPhoneNumber({
        phoneNumber,
        code: verificationCode
      });
      
      if (isValid) {
        // Show success toast
        toast({
          title: "Success!",
          description: "Your phone number has been verified and account is now active.",
        });
        
        // Sign in the user automatically since account was just created
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error("Auto sign-in error:", signInError);
          // Redirect to login with success message instead
          navigate("/login", { 
            state: { message: "Account created successfully! Please sign in to continue." } 
          });
        } else {
          // Redirect to profile page
          navigate("/profile");
        }
      } else {
        setIsCodeValid(false);
        toast({
          title: "Verification Failed",
          description: error || "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
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
      console.error("Error resending code:", error);
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
