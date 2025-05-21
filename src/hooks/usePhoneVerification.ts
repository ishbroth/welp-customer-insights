
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { verifyPhoneNumber, resendVerificationCode } from "@/lib/utils";
import { useVerificationTimer } from "@/hooks/useVerificationTimer";
import { supabase } from "@/integrations/supabase/client";

interface PhoneVerificationProps {
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
}

export const usePhoneVerification = ({
  email,
  password,
  name,
  phoneNumber,
  accountType,
  businessName,
  address,
  city,
  state,
  zipCode
}: PhoneVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    isDisabled: isResendDisabled, 
    timer, 
    startTimer 
  } = useVerificationTimer();
  
  const handleVerifyCode = async () => {
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
        // Sign up with Supabase
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone: phoneNumber,
              type: accountType,
              address,
              city,
              state,
              zipCode
            },
            emailRedirectTo: window.location.origin + '/login'
          }
        });
        
        if (signUpError) {
          toast({
            title: "Signup Error",
            description: signUpError.message,
            variant: "destructive"
          });
          setIsVerifying(false);
          return;
        }
        
        // Confirm email immediately since phone is verified
        if (data.user) {
          try {
            await supabase.functions.invoke('confirm-email', {
              body: { userId: data.user.id, email }
            });
          } catch (confirmError) {
            console.error("Error confirming email:", confirmError);
            // Continue with account creation even if email confirmation fails
          }
        }
        
        // Create profile
        const { error: profileError } = await supabase.functions.invoke('create-profile', {
          body: {
            userId: data.user?.id,
            name,
            phone: phoneNumber,
            address,
            city,
            state,
            zipCode,
            type: accountType,
            businessName
          }
        });
        
        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
        
        // Show success toast
        toast({
          title: "Success!",
          description: "Your account has been created successfully.",
        });
        
        // Redirect to login page with success message
        navigate("/login", { 
          state: { message: "Account created successfully! Please sign in to continue." } 
        });
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
    verificationCode,
    setVerificationCode,
    isCodeValid,
    isVerifying,
    isResending,
    isResendDisabled,
    resendTimer: timer,
    handleVerifyCode,
    handleResendCode
  };
};
