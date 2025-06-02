
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { BusinessInfoForm } from "./BusinessInfoForm";
import { BusinessVerificationDisplay } from "./BusinessVerificationDisplay";
import { PhoneVerificationFlow } from "./PhoneVerificationFlow";
import { PasswordSetupStep } from "./PasswordSetupStep";
import VerificationSuccessPopup from "./VerificationSuccessPopup";
import { useBusinessVerification } from "@/hooks/useBusinessVerification";
import { useBusinessAccountCreation } from "@/hooks/useBusinessAccountCreation";

interface BusinessSignupFormProps {
  step: number;
  setStep: (step: number) => void;
}

const BusinessSignupForm = ({ step, setStep }: BusinessSignupFormProps) => {
  const { currentUser } = useAuth();
  
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
  
  // Use custom hooks for verification and account creation
  const {
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
  } = useBusinessVerification(currentUser?.id);

  const {
    isSubmitting,
    showSuccessPopup,
    setShowSuccessPopup,
    createBusinessAccount
  } = useBusinessAccountCreation();
  
  // Business verification handlers
  const handleBusinessVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await performBusinessVerification(
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
    
    if (result.success && result.nextStep) {
      setStep(result.nextStep);
    }
  };
  
  const handleCreateBusinessAccount = async () => {
    const result = await createBusinessAccount(
      businessName,
      businessEmail,
      businessPassword,
      businessConfirmPassword,
      businessPhone,
      businessStreet,
      businessCity,
      businessState,
      businessZipCode,
      licenseNumber,
      businessType
    );
    
    if (result.success && !result.showPopup) {
      // Navigation is handled in the hook
    }
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
