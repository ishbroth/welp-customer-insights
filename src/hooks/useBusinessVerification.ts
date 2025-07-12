import { useState } from "react";
import { verifyBusinessId } from "@/utils/businessVerification";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBusinessVerification = (currentUserId?: string) => {
  const { isVerified } = useVerifiedStatus(currentUserId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationError, setVerificationError] = useState("");
  const [showTextVerification, setShowTextVerification] = useState(false);
  const [realVerificationDetails, setRealVerificationDetails] = useState<any>(null);
  const [showAccountCreatedPopup, setShowAccountCreatedPopup] = useState(false);
  const [createdBusinessData, setCreatedBusinessData] = useState<any>(null);
  const { toast } = useToast();

  const performBusinessVerification = async (
    businessName: string,
    businessEmail: string,
    businessPhone: string,
    businessStreet: string,
    businessCity: string,
    businessState: string,
    businessZipCode: string,
    licenseNumber: string,
    businessType: string
  ) => {
    setIsVerifying(true);
    setVerificationError("");
    
    // Validate business email
    if (!businessEmail || !businessEmail.includes('@')) {
      setVerificationError("Please provide a valid business email address.");
      setIsVerifying(false);
      return { success: false };
    }

    // Validate required state field
    if (!businessState || !businessState.trim()) {
      setVerificationError("Please select a state for your business location.");
      setIsVerifying(false);
      return { success: false };
    }
    
    try {
      // Use only real license verification - no mock fallback
      const result = await verifyBusinessId(licenseNumber, businessType, businessState);
      
      if (result.verified && result.isRealVerification) {
        // Real verification successful - proceed with verified account creation
        console.log('Real verification successful:', result);
        
        setRealVerificationDetails({
          businessName,
          verificationDetails: {
            type: result.details?.type || "Business License",
            status: result.details?.status || "Active",
            issuingAuthority: result.details?.issuingAuthority || `${businessState} State Database`,
            licenseState: businessState
          }
        });
        
        // Store verified business data for account creation
        const businessData = {
          name: businessName,
          email: businessEmail,
          phone: businessPhone,
          address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
          licenseNumber: licenseNumber,
          businessType: businessType,
          state: businessState,
          city: businessCity,
          verificationMethod: "real_license",
          isFullyVerified: true,
          realVerificationResult: result
        };
        
        sessionStorage.setItem("businessVerificationData", JSON.stringify(businessData));
        return { success: true, nextStep: 2 };
        
      } else {
        // Real verification failed or not available - create unverified account
        console.log('Real verification failed or unavailable:', result);
        
        await createUnverifiedAccount(
          businessName,
          businessEmail,
          businessPhone,
          businessStreet,
          businessCity,
          businessState,
          businessZipCode,
          licenseNumber,
          businessType
        );
        return { success: false };
      }
    } catch (error) {
      setVerificationError(`License verification failed. ${isVerified ? 'You can update your license information or try again.' : 'Your account will be created and you can submit for manual verification later.'}`);
      console.error("Verification error:", error);
      
      // Create unverified account even on error
      await createUnverifiedAccount(
        businessName,
        businessEmail,
        businessPhone,
        businessStreet,
        businessCity,
        businessState,
        businessZipCode,
        licenseNumber,
        businessType
      );
      return { success: false };
    } finally {
      setIsVerifying(false);
    }
  };

  const createUnverifiedAccount = async (
    businessName: string,
    businessEmail: string,
    businessPhone: string,
    businessStreet: string,
    businessCity: string,
    businessState: string,
    businessZipCode: string,
    licenseNumber: string,
    businessType: string
  ) => {
    try {
      // Generate a temporary password for account creation
      const tempPassword = Math.random().toString(36).slice(-12) + "Temp123!";
      
      // Create the account with Supabase Auth
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: businessEmail,
        password: tempPassword,
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
        return;
      }

      // Confirm email immediately
      if (data.user) {
        try {
          await supabase.functions.invoke('confirm-email', {
            body: { userId: data.user.id, email: businessEmail }
          });
        } catch (confirmError) {
          console.error("Error confirming email:", confirmError);
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

      // Store business data and show popup - account created but NOT verified
      const businessData = {
        name: businessName,
        email: businessEmail,
        password: tempPassword,
        phone: businessPhone,
        address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
        street: businessStreet,
        city: businessCity,
        state: businessState,
        zipCode: businessZipCode,
        businessName: businessName,
        businessId: licenseNumber,
        businessType: businessType,
        verificationMethod: "manual_required",
        isFullyVerified: false
      };

      setCreatedBusinessData(businessData);
      setShowAccountCreatedPopup(true);

    } catch (error) {
      console.error("Account creation error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during account creation.",
        variant: "destructive"
      });
    }
  };

  const handleVerificationSuccess = (data: any) => {
    setVerificationData(data);
    setShowTextVerification(false);
  };

  const handleEditInformation = () => {
    setVerificationData(null);
    setVerificationError("");
    setShowTextVerification(false);
    sessionStorage.removeItem("businessVerificationData");
  };

  const handleBackToForm = () => {
    setShowTextVerification(false);
    setVerificationError("");
  };

  return {
    isVerified,
    isVerifying,
    verificationData,
    verificationError,
    setVerificationError,
    showTextVerification,
    realVerificationDetails,
    showAccountCreatedPopup,
    setShowAccountCreatedPopup,
    createdBusinessData,
    performBusinessVerification,
    handleVerificationSuccess,
    handleEditInformation,
    handleBackToForm
  };
};
