import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { verifyBusinessId } from "@/utils/businessVerification";
import { useAuth } from "@/contexts/auth";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";
import { BusinessInfoForm } from "./BusinessInfoForm";
import { BusinessVerificationDisplay } from "./BusinessVerificationDisplay";
import { PhoneVerificationFlow } from "./PhoneVerificationFlow";
import { PasswordSetupStep } from "./PasswordSetupStep";
import VerificationSuccessPopup from "./VerificationSuccessPopup";
import { supabase } from "@/integrations/supabase/client";

interface BusinessSignupFormProps {
  step: number;
  setStep: (step: number) => void;
}

const BusinessSignupForm = ({ step, setStep }: BusinessSignupFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup, currentUser } = useAuth();
  const { isVerified } = useVerifiedStatus(currentUser?.id);
  
  // Business form state
  const [businessName, setBusinessName] = useState("");
  const [businessStreet, setBusinessStreet] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessZipCode, setBusinessZipCode] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessType, setBusinessType] = useState("ein");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPassword, setBusinessPassword] = useState("");
  const [businessConfirmPassword, setBusinessConfirmPassword] = useState("");
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationError, setVerificationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTextVerification, setShowTextVerification] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [realVerificationDetails, setRealVerificationDetails] = useState<any>(null);
  
  // Business verification handlers
  const handleBusinessVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationError("");
    
    // Validate business email
    if (!businessEmail || !businessEmail.includes('@')) {
      setVerificationError("Please provide a valid business email address.");
      setIsVerifying(false);
      return;
    }
    
    try {
      // Use the business verification utility with state-specific verification
      const result = await verifyBusinessId(licenseNumber, businessType, businessState);
      
      if (result.verified && result.isRealVerification) {
        // Real verification successful - proceed with immediate verification
        console.log('Real verification successful:', result);
        
        setRealVerificationDetails({
          businessName,
          verificationDetails: result.details || {
            type: "Business License",
            status: "Active"
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
        setStep(2); // Go to password setup
        
      } else if (result.verified && !result.isRealVerification) {
        // Mock verification - use existing flow
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
          licenseExpiration: result.details?.expirationDate || "2025-12-31"
        });
        setVerificationError("");
      } else {
        // Offer text verification as an alternative
        setVerificationData(null);
        setShowTextVerification(true);
        setVerificationError(result.message || `We couldn't verify your business license. ${isVerified ? 'You can update your license information or' : 'You can'} proceed with phone verification instead.`);
      }
    } catch (error) {
      setVerificationError(`An error occurred during verification. ${isVerified ? 'You can update your license information or try again.' : 'Please try again.'}`);
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleCreateBusinessAccount = async () => {
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
      return;
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
        } else {
          toast({
            title: "Account Created",
            description: "Your business account has been created with limited access. Complete verification for full access.",
          });
          navigate("/business-verification-success");
        }
      } else {
        toast({
          title: "Signup Failed",
          description: error || "An error occurred while creating your account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
  
  return (
    <>
      {step === 1 && !verificationData && !showTextVerification && (
        <form onSubmit={handleBusinessVerification}>
          <BusinessInfoForm
            businessName={businessName}
            setBusinessName={setBusinessName}
            businessEmail={businessEmail}
            setBusinessEmail={setBusinessEmail}
            businessStreet={businessStreet}
            setBusinessStreet={setBusinessStreet}
            businessCity={businessCity}
            setBusinessCity={setBusinessCity}
            businessState={businessState}
            setBusinessState={setBusinessState}
            businessZipCode={businessZipCode}
            setBusinessZipCode={setBusinessZipCode}
            businessPhone={businessPhone}
            setBusinessPhone={setBusinessPhone}
            businessType={businessType}
            setBusinessType={setBusinessType}
            licenseNumber={licenseNumber}
            setLicenseNumber={setLicenseNumber}
          />
          
          {verificationError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mt-4">
              {verificationError}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="welp-button w-full mt-6" 
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : (isVerified ? "Update License Information" : "Verify Business")}
          </Button>
        </form>
      )}

      {step === 1 && showTextVerification && !verificationData && (
        <PhoneVerificationFlow
          businessPhone={businessPhone}
          setBusinessPhone={setBusinessPhone}
          verificationError={verificationError}
          setVerificationError={setVerificationError}
          onVerificationSuccess={handleVerificationSuccess}
          onBack={handleBackToForm}
          businessName={businessName}
          businessStreet={businessStreet}
          businessCity={businessCity}
          businessState={businessState}
          businessZipCode={businessZipCode}
          businessEmail={businessEmail}
          businessType={businessType}
        />
      )}

      {step === 1 && verificationData && (
        <BusinessVerificationDisplay
          verificationData={verificationData}
          onContinue={() => setStep(2)}
          onEdit={handleEditInformation}
        />
      )}

      {step === 2 && (
        <PasswordSetupStep
          businessPassword={businessPassword}
          setBusinessPassword={setBusinessPassword}
          businessConfirmPassword={businessConfirmPassword}
          setBusinessConfirmPassword={setBusinessConfirmPassword}
          isSubmitting={isSubmitting}
          onCreateAccount={handleCreateBusinessAccount}
        />
      )}
      
      {showSuccessPopup && realVerificationDetails && (
        <VerificationSuccessPopup
          isOpen={showSuccessPopup}
          businessName={realVerificationDetails.businessName}
          verificationDetails={realVerificationDetails.verificationDetails}
        />
      )}
    </>
  );
};

export default BusinessSignupForm;
