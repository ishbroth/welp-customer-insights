
import { useAuth } from "@/contexts/auth";
import { BusinessVerificationDisplay } from "./BusinessVerificationDisplay";
import { PhoneVerificationFlow } from "./PhoneVerificationFlow";
import { PasswordSetupStep } from "./PasswordSetupStep";
import { BusinessVerificationStep } from "./BusinessVerificationStep";
import { BusinessSignupPopups } from "./BusinessSignupPopups";
import { useBusinessVerification } from "@/hooks/useBusinessVerification";
import { useBusinessAccountCreation } from "@/hooks/useBusinessAccountCreation";
import { useBusinessFormState } from "@/hooks/useBusinessFormState";

interface BusinessSignupFormProps {
  step: number;
  setStep: (step: number) => void;
}

const BusinessSignupForm = ({ step, setStep }: BusinessSignupFormProps) => {
  const { currentUser } = useAuth();
  
  // Use custom hook for form state management
  const {
    businessName,
    setBusinessName,
    businessStreet,
    setBusinessStreet,
    businessApartmentSuite,
    setBusinessApartmentSuite,
    businessCity,
    setBusinessCity,
    businessState,
    setBusinessState,
    businessZipCode,
    setBusinessZipCode,
    businessPhone,
    setBusinessPhone,
    businessType,
    setBusinessType,
    licenseNumber,
    setLicenseNumber,
    businessEmail,
    setBusinessEmail,
    businessPassword,
    setBusinessPassword,
    businessConfirmPassword,
    setBusinessConfirmPassword,
    hasDuplicates,
    setHasDuplicates
  } = useBusinessFormState();
  
  // Use custom hooks for verification and account creation
  const {
    isVerified,
    isVerifying,
    verificationData,
    verificationError,
    setVerificationError,
    showTextVerification,
    realVerificationDetails,
    showAccountCreatedPopup: verificationAccountCreatedPopup,
    setShowAccountCreatedPopup: setVerificationAccountCreatedPopup,
    createdBusinessData: verificationCreatedBusinessData,
    performBusinessVerification,
    handleVerificationSuccess,
    handleEditInformation,
    handleBackToForm
  } = useBusinessVerification(currentUser?.id);

  const {
    isSubmitting,
    showAccountCreatedPopup: passwordAccountCreatedPopup,
    setShowAccountCreatedPopup: setPasswordAccountCreatedPopup,
    createdBusinessData: passwordCreatedBusinessData,
    createBusinessAccount
  } = useBusinessAccountCreation();
  
  // Business verification handlers
  const handleBusinessVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Block verification if duplicates exist
    if (hasDuplicates) {
      setVerificationError("Please resolve duplicate account issues before proceeding.");
      return;
    }
    
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
    // Block account creation if duplicates exist
    if (hasDuplicates) {
      return;
    }
    
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
    
    if (result.success) {
      // The popup will be shown automatically
    }
  };
  
  return (
    <>
      {step === 1 && !verificationData && !showTextVerification && (
        <BusinessVerificationStep
          businessName={businessName}
          setBusinessName={setBusinessName}
          businessEmail={businessEmail}
          setBusinessEmail={setBusinessEmail}
          businessStreet={businessStreet}
          setBusinessStreet={setBusinessStreet}
          businessApartmentSuite={businessApartmentSuite}
          setBusinessApartmentSuite={setBusinessApartmentSuite}
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
          hasDuplicates={hasDuplicates}
          onDuplicateFound={setHasDuplicates}
          verificationError={verificationError}
          isVerifying={isVerifying}
          isVerified={isVerified}
          onSubmit={handleBusinessVerification}
        />
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
          disabled={hasDuplicates}
        />
      )}
      
      <BusinessSignupPopups
        realVerificationDetails={realVerificationDetails}
        showAccountCreatedPopup={verificationAccountCreatedPopup || passwordAccountCreatedPopup}
        setShowAccountCreatedPopup={verificationAccountCreatedPopup ? setVerificationAccountCreatedPopup : setPasswordAccountCreatedPopup}
        createdBusinessData={verificationCreatedBusinessData || passwordCreatedBusinessData}
        businessPhone={businessPhone}
        setBusinessPhone={setBusinessPhone}
      />
    </>
  );
};

export default BusinessSignupForm;
