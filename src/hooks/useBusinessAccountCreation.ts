
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

    if (businessPassword.length < 6) {
      console.error("Password validation failed: password too short");
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
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
      
      // Navigate to phone verification page with all the data as URL params
      // FIXED: Changed from /phone-verification to /verify-phone to match actual route
      const params = new URLSearchParams({
        email: businessEmail,
        password: businessPassword,
        name: businessName,
        phone: businessPhone,
        accountType: 'business',
        businessName: businessName,
        address: businessStreet,
        city: businessCity,
        state: businessState,
        zipCode: businessZipCode
      });
      
      console.log("Navigating to phone verification with params:", params.toString());
      
      navigate(`/verify-phone?${params.toString()}`);
      
      console.log("=== BUSINESS ACCOUNT CREATION DEBUG END (SUCCESS) ===");
      return { success: true };

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
