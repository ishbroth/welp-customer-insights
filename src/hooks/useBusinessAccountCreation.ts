
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerificationCode } from "@/utils/emailUtils";

export const useBusinessAccountCreation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const initiateEmailVerification = async (
    businessName: string,
    businessEmail: string,
    businessPassword: string,
    businessConfirmPassword: string,
    businessPhone: string,
    businessStreet: string,
    businessCity: string,
    businessState: string,
    businessZipCode: string,
    licenseNumber: string,
    businessType: string
  ) => {
    // Validation
    if (businessPassword !== businessConfirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive"
      });
      return;
    }

    if (businessPassword.length < 8) {
      toast({
        title: "Password Too Short", 
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Store business data for verification step
      const businessData = {
        businessName,
        businessEmail,
        businessPassword,
        businessPhone,
        businessStreet,
        businessCity,
        businessState,
        businessZipCode,
        licenseNumber,
        businessType
      };
      localStorage.setItem("pendingVerification", JSON.stringify(businessData));

      // Send email verification code
      const { success, message } = await sendEmailVerificationCode({ 
        email: businessEmail 
      });

      if (success) {
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${businessEmail}.`,
        });

        // Navigate to email verification page
        navigate(`/verify-email?email=${encodeURIComponent(businessEmail)}&type=business`);
      } else {
        toast({
          title: "Error",
          description: message || "Failed to send verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error initiating email verification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    initiateEmailVerification
  };
};
