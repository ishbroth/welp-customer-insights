
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessAccountCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
    if (
      !businessEmail || 
      !businessPassword || 
      businessPassword !== businessConfirmPassword
    ) {
      toast({
        title: "Error",
        description: "Please check your form inputs and try again.",
        variant: "destructive",
      });
      return { success: false };
    }
    
    setIsSubmitting(true);
    
    try {
      // Get verification data from session storage
      const verificationDataStr = sessionStorage.getItem("businessVerificationData");
      const verificationInfo = verificationDataStr ? JSON.parse(verificationDataStr) : null;
      
      const fullBusinessName = `${businessName} (${businessType})`;
      
      const { success, error } = await signup({
        email: businessEmail,
        password: businessPassword,
        name: fullBusinessName,
        phone: businessPhone,
        zipCode: businessZipCode,
        type: "business",
        address: businessStreet,
        city: businessCity,
        state: businessState
      });
      
      if (success) {
        // If this was real verification, update the business_info table immediately
        if (verificationInfo?.verificationMethod === "real_license") {
          try {
            // Wait a moment for the profile to be created
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { error: updateError } = await supabase
                .from('business_info')
                .upsert({
                  id: user.id,
                  business_name: businessName,
                  license_number: licenseNumber,
                  license_type: businessType,
                  license_state: businessState,
                  verified: true,
                  license_status: verificationInfo.realVerificationResult?.details?.status || "Active",
                  additional_info: `Real-time verified: ${verificationInfo.realVerificationResult?.details?.issuingAuthority || 'State Database'}`
                });
                
              if (updateError) {
                console.error("Error updating business info:", updateError);
              } else {
                console.log("Business info updated with verification status");
              }
            }
          } catch (updateError) {
            console.error("Error in post-signup verification update:", updateError);
          }
          
          // Show success popup for real verification
          setShowSuccessPopup(true);
          return { success: true, showPopup: true };
        } else {
          toast({
            title: "Account Created",
            description: "Your business account has been created with limited access. Complete verification for full access.",
          });
          navigate("/business-verification-success");
          return { success: true, showPopup: false };
        }
      } else {
        toast({
          title: "Signup Failed",
          description: error || "An error occurred while creating your account.",
          variant: "destructive",
        });
        return { success: false };
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showSuccessPopup,
    setShowSuccessPopup,
    createBusinessAccount
  };
};
