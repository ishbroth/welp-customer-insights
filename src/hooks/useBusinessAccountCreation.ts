
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerificationCode } from "@/utils/emailUtils";
import { verifyBusinessId } from "@/utils/businessVerification";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useBusinessAccountCreation');

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
      // Perform license verification
      hookLogger.info("Performing license verification during signup");
      let licenseVerificationResult = null;

      try {
        licenseVerificationResult = await verifyBusinessId(
          licenseNumber,
          businessType,
          businessState
        );
        hookLogger.info("License verification result:", licenseVerificationResult);
      } catch (verificationError) {
        hookLogger.error("License verification failed:", verificationError);
        // Continue with signup even if verification fails
        licenseVerificationResult = {
          verified: false,
          message: "Verification unavailable during signup",
          isRealVerification: false
        };
      }

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
        businessType,
        licenseVerificationResult
      };

      hookLogger.debug("Storing pending verification data:", businessData);
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

        hookLogger.info("Navigating to email verification page");
        // Navigate to email verification page with business type
        navigate(`/verify-email?email=${encodeURIComponent(businessEmail)}&type=business`);
      } else {
        toast({
          title: "Error",
          description: message || "Failed to send verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      hookLogger.error("Error initiating email verification:", error);
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
