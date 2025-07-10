
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
    // Validate passwords
    if (businessPassword !== businessConfirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive"
      });
      return { success: false };
    }

    if (businessPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return { success: false };
    }

    if (!businessPhone) {
      toast({
        title: "Phone Required",
        description: "Phone number is required for verification.",
        variant: "destructive"
      });
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      // Send verification code
      const { success, error } = await sendVerificationCode({ phoneNumber: businessPhone });
      
      if (success) {
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
        
        return { success: true };
      } else {
        toast({
          title: "Error",
          description: error || "Failed to send verification code. Please try again.",
          variant: "destructive"
        });
        return { success: false };
      }

    } catch (error) {
      console.error("Verification initiation error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification setup.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    initiatePhoneVerification
  };
};
