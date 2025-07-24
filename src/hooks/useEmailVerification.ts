
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseEmailVerificationProps {
  email: string;
  password: string;
  name: string;
  accountType: 'customer' | 'business';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessName?: string;
  licenseNumber?: string;
  licenseType?: string;
}

export const useEmailVerification = ({
  email,
  password,
  name,
  accountType,
  address,
  city,
  state,
  zipCode,
  firstName,
  lastName,
  phone,
  businessName,
  licenseNumber,
  licenseType
}: UseEmailVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(60);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate verification code
  useEffect(() => {
    setIsCodeValid(verificationCode.length === 6 && /^\d{6}$/.test(verificationCode));
  }, [verificationCode]);

  // Resend timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isResendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isResendDisabled, resendTimer]);

  const handleVerifyCode = async () => {
    if (!isCodeValid) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      console.log("🔍 Verifying email code and creating account...");
      
      // Prepare user data for account creation
      const userData = {
        password,
        name,
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode,
        businessName,
        licenseNumber,
        licenseType
      };

      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: {
          email,
          code: verificationCode,
          accountType,
          userData
        }
      });

      if (error) {
        console.error("❌ Error verifying email code:", error);
        throw error;
      }

      if (data.success && data.isValid) {
        console.log("✅ Account created successfully");
        
        toast({
          title: "Account Created!",
          description: "Your email has been verified and account created successfully.",
        });

        // Clear any stored verification data
        localStorage.removeItem("pendingVerification");
        
        // The edge function should have automatically signed in the user
        // Give it a moment to establish the session, then redirect to profile
        setTimeout(() => {
          navigate("/profile", { replace: true });
        }, 1000);
        
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid or expired verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Error verifying email code:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify email code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-email-verification-code', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email.",
        });
        setIsResendDisabled(true);
        setResendTimer(60);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return {
    verificationCode,
    setVerificationCode,
    isCodeValid,
    isVerifying,
    isResending,
    isResendDisabled,
    resendTimer,
    handleVerifyCode,
    handleResendCode
  };
};
