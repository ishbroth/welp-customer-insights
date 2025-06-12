
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { verifyPhoneNumber, resendVerificationCode } from "@/lib/utils";

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
    if (!phoneNumber || !verificationCode || !email) {
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
          title: "Phone Verified!",
          description: "Your phone number has been verified. Now let's set up your password.",
        });
        
        // Redirect to password setup instead of auto-creating account
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
          // For customer accounts, we'll need a similar password setup page
          // For now, redirect to login with a message
          navigate("/login", {
            state: {
              message: "Phone verified! Please complete your account setup by logging in.",
              email: email
            }
          });
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
