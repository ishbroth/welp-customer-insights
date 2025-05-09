
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useVerificationTimer } from "./useVerificationTimer";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { createSearchableCustomer } from "@/services/customerService";
import { supabase } from "@/integrations/supabase/client";

interface VerificationParams {
  email: string | null;
  password: string | null;
  name: string | null;
  phoneNumber: string | null;
  accountType: string | null;
  businessName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

// Function to send verification code
const sendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
  const { data, error } = await supabase.functions.invoke('verify-phone', {
    body: {
      phoneNumber,
      actionType: "send"
    }
  });
  
  if (error) throw new Error(error.message);
  return data;
};

// Function to verify phone number
const verifyPhoneNumber = async ({ phoneNumber, code }: { phoneNumber: string, code: string }) => {
  const { data, error } = await supabase.functions.invoke('verify-phone', {
    body: {
      phoneNumber,
      code,
      actionType: "verify"
    }
  });
  
  if (error) throw new Error(error.message);
  return data;
};

export const usePhoneVerification = (params: VerificationParams) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(true);
  const { isDisabled, timer, startTimer } = useVerificationTimer();
  
  const { email, password, name, phoneNumber, accountType, 
          businessName, address, city, state, zipCode } = params;
  
  // Mutation for verifying phone number
  const { mutate: verifyCode, isPending: isVerifying } = useMutation({
    mutationFn: verifyPhoneNumber,
    onSuccess: async (data) => {
      if (data?.isValid) {
        setIsCodeValid(true);
        
        // Proceed with signup after successful verification
        if (email && password && name && phoneNumber && accountType) {
          try {
            // Sign up the user with the updated signup function interface
            await signup({
              email, 
              password, 
              name, 
              phone: phoneNumber,
              type: accountType as "customer" | "business",
              zipCode, 
              address,
              city,
              state,
              businessName
            });
            
            // Create a searchable customer profile
            await createSearchableCustomer({
              firstName: name?.split(' ')[0] || "",
              lastName: name?.split(' ').slice(1).join(' ') || "",
              phone: phoneNumber || "",
              address: address || "",
              city: city || "",
              state: state || "",
              zipCode: zipCode || ""
            });
            
            toast({
              title: "Verification successful",
              description: "Your phone number has been successfully verified.",
            });
            
            // Redirect based on account type
            if (accountType === "business") {
              navigate("/business-verification-success");
            } else {
              navigate("/");
            }
          } catch (error: any) {
            console.error("Signup failed:", error);
            toast({
              title: "Signup failed",
              description: error.message || "An error occurred during signup.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Missing information",
            description: "Some required information is missing. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        setIsCodeValid(false);
        toast({
          title: "Invalid code",
          description: "The verification code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Verification failed:", error);
      toast({
        title: "Verification failed",
        description: error.message || "An error occurred during verification.",
        variant: "destructive",
      });
      setIsCodeValid(false);
    },
  });
  
  // Mutation for resending verification code
  const { mutate: resendCode, isPending: isResending } = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: () => {
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your phone number.",
      });
      startTimer();
    },
    onError: (error: any) => {
      console.error("Resend code failed:", error);
      toast({
        title: "Resend failed",
        description: error.message || "Failed to resend the verification code.",
        variant: "destructive",
      });
    },
  });
  
  const handleVerifyCode = () => {
    if (phoneNumber && verificationCode) {
      verifyCode({ phoneNumber, code: verificationCode });
    } else {
      toast({
        title: "Missing information",
        description: "Please enter both your phone number and the verification code.",
        variant: "destructive",
      });
    }
  };
  
  const handleResendCode = () => {
    if (phoneNumber) {
      resendCode({ phoneNumber });
    } else {
      toast({
        title: "Missing phone number",
        description: "Please provide your phone number to resend the verification code.",
        variant: "destructive",
      });
    }
  };
  
  return {
    verificationCode,
    setVerificationCode,
    isCodeValid,
    isVerifying,
    isResending,
    isResendDisabled: isDisabled,
    resendTimer: timer,
    handleVerifyCode,
    handleResendCode
  };
};
