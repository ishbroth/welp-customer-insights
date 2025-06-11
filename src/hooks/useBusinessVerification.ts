
import { useState } from "react";
import { verifyBusinessId } from "@/utils/businessVerification";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

export const useBusinessVerification = (currentUserId?: string) => {
  const { isVerified } = useVerifiedStatus(currentUserId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationError, setVerificationError] = useState("");
  const [showTextVerification, setShowTextVerification] = useState(false);
  const [realVerificationDetails, setRealVerificationDetails] = useState<any>(null);

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
      // Use the business verification utility with state-specific verification
      const result = await verifyBusinessId(licenseNumber, businessType, businessState);
      
      if (result.verified && result.isRealVerification) {
        // Real verification successful - proceed with immediate verification
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
        
        // Store business data for account creation
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
        
      } else if (result.verified && !result.isRealVerification) {
        // Mock verification - use existing flow with proper state information
        const businessData = {
          name: businessName,
          email: businessEmail,
          phone: businessPhone,
          address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
          licenseNumber: licenseNumber,
          businessType: businessType,
          state: businessState,
          city: businessCity,
          verificationMethod: "license",
          isFullyVerified: false
        };
        
        sessionStorage.setItem("businessVerificationData", JSON.stringify(businessData));
        
        setVerificationData({
          name: businessName,
          address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
          phone: businessPhone,
          email: businessEmail,
          licenseStatus: "Active",
          licenseType: result.details?.type || "General Business",
          licenseExpiration: result.details?.expirationDate || "2025-12-31",
          licenseState: businessState
        });
        setVerificationError("");
        return { success: true, nextStep: 1 };
      } else {
        // Offer text verification as an alternative
        setVerificationData(null);
        setShowTextVerification(true);
        setVerificationError(result.message || `We couldn't verify your business license. ${isVerified ? 'You can update your license information or' : 'You can'} proceed with phone verification instead.`);
        return { success: false };
      }
    } catch (error) {
      setVerificationError(`An error occurred during verification. ${isVerified ? 'You can update your license information or try again.' : 'Please try again.'}`);
      console.error("Verification error:", error);
      return { success: false };
    } finally {
      setIsVerifying(false);
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
    performBusinessVerification,
    handleVerificationSuccess,
    handleEditInformation,
    handleBackToForm
  };
};
