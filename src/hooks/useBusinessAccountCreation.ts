
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

export const useBusinessAccountCreation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const createBusinessAccount = async (
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

    setIsSubmitting(true);

    try {
      const result = await signup({
        email: businessEmail,
        password: businessPassword,
        name: businessName,
        phone: businessPhone,
        zipCode: businessZipCode,
        address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
        city: businessCity,
        state: businessState,
        type: 'business',
        businessName: businessName
      });

      if (result.success) {
        toast({
          title: "Business Account Created Successfully!",
          description: "Your business account has been created. You can now log in.",
        });
        
        navigate("/login", {
          state: {
            message: "Business account created successfully! Please log in with your credentials.",
            email: businessEmail
          }
        });
        
        return { success: true };
      } else {
        toast({
          title: "Signup Error",
          description: result.error || "Failed to create business account. Please try again.",
          variant: "destructive"
        });
        return { success: false };
      }

    } catch (error) {
      console.error("Account creation error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during account creation.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    createBusinessAccount
  };
};
