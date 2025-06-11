
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessAccountCreation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountCreatedPopup, setShowAccountCreatedPopup] = useState(false);
  const [createdBusinessData, setCreatedBusinessData] = useState<any>(null);
  const { toast } = useToast();

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
      // Create the account with Supabase Auth
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: businessEmail,
        password: businessPassword,
        options: {
          data: {
            name: businessName,
            phone: businessPhone,
            type: 'business',
            address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
            city: businessCity,
            state: businessState,
            zipCode: businessZipCode,
            businessId: licenseNumber,
            businessType: businessType
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
        return { success: false };
      }

      // Confirm email immediately since we'll do phone verification instead
      if (data.user) {
        try {
          await supabase.functions.invoke('confirm-email', {
            body: { userId: data.user.id, email: businessEmail }
          });
        } catch (confirmError) {
          console.error("Error confirming email:", confirmError);
          // Continue with account creation even if email confirmation fails
        }
      }

      // Create profile using edge function
      const { error: profileError } = await supabase.functions.invoke('create-profile', {
        body: {
          userId: data.user?.id,
          name: businessName,
          phone: businessPhone,
          address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
          city: businessCity,
          state: businessState,
          zipCode: businessZipCode,
          type: 'business',
          businessName,
          businessId: licenseNumber,
          businessType: businessType
        }
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      // Store business data for the popup
      const businessData = {
        name: businessName,
        email: businessEmail,
        password: businessPassword,
        phone: businessPhone,
        address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
        street: businessStreet,
        city: businessCity,
        state: businessState,
        zipCode: businessZipCode,
        businessName: businessName,
        businessId: licenseNumber,
        businessType: businessType,
        verificationMethod: "phone",
        isFullyVerified: false
      };

      setCreatedBusinessData(businessData);
      setShowAccountCreatedPopup(true);

      return { success: true };

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
    showAccountCreatedPopup,
    setShowAccountCreatedPopup,
    createdBusinessData,
    createBusinessAccount
  };
};
