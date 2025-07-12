
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { sendVerificationCode } from "@/lib/utils";

export const useBusinessAccountCreation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const initiatePhoneVerification = async (
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
    console.log("=== BUSINESS ACCOUNT CREATION DEBUG START ===");
    console.log("Business Details:", {
      businessName,
      businessEmail,
      businessPhone,
      businessStreet,
      businessCity,
      businessState,
      businessZipCode,
      licenseNumber,
      businessType
    });

    // Validate passwords
    if (businessPassword !== businessConfirmPassword) {
      console.error("Password validation failed: passwords do not match");
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive"
      });
      return { success: false };
    }

    if (businessPassword.length < 8) {
      console.error("Password validation failed: password too short");
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return { success: false };
    }

    if (!businessPhone) {
      console.error("Validation failed: phone number required");
      toast({
        title: "Phone Required",
        description: "Phone number is required for verification.",
        variant: "destructive"
      });
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      console.log("Attempting to send verification code to:", businessPhone);
      
      // Send verification code
      const { success, error } = await sendVerificationCode({ phoneNumber: businessPhone });
      
      console.log("Verification code response:", { success, error });
      
      if (success) {
        console.log("Verification code sent successfully, navigating to phone verification");
        
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${businessPhone}.`,
        });

        // Navigate to phone verification page with business data
        navigate("/phone-verification", {
          state: {
            email: businessEmail,
            password: businessPassword,
            name: businessName,
            phoneNumber: businessPhone,
            accountType: 'business',
            businessName: businessName,
            address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
            city: businessCity,
            state: businessState,
            zipCode: businessZipCode
          }
        });
        
        console.log("=== BUSINESS ACCOUNT CREATION DEBUG END (SUCCESS) ===");
        return { success: true };
      } else {
        console.error("Failed to send verification code:", error);
        toast({
          title: "Error",
          description: error || "Failed to send verification code. Please try again.",
          variant: "destructive"
        });
        return { success: false };
      }

    } catch (error) {
      console.error("Verification initiation error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification setup.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
      console.log("=== BUSINESS ACCOUNT CREATION DEBUG END ===");
    }
  };

  return {
    isSubmitting,
    initiatePhoneVerification
  };
};
