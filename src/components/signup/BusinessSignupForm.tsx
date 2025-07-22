
import { useAuth } from "@/contexts/auth";
import { BusinessVerificationStep } from "./BusinessVerificationStep";
import { PasswordSetupStep } from "./PasswordSetupStep";
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
  
  const {
    isSubmitting,
    initiateEmailVerification
  } = useBusinessAccountCreation();
  
  // Business form validation and step progression
  const handleBusinessInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!businessName.trim() || !businessEmail.trim() || !businessStreet.trim() || 
        !businessCity.trim() || !businessState.trim() || !businessZipCode.trim() || 
        !businessPhone.trim() || !businessType.trim() || !licenseNumber.trim()) {
      return;
    }
    
    // Block if duplicates exist
    if (hasDuplicates) {
      return;
    }
    
    // Move to password setup step
    setStep(2);
  };
  
  const handleCreateBusinessAccount = async () => {
    // Block account creation if duplicates exist
    if (hasDuplicates) {
      return;
    }
    
    await initiateEmailVerification(
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
  };
  
  return (
    <>
      {step === 1 && (
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
          verificationError=""
          isVerifying={false}
          isVerified={false}
          onSubmit={handleBusinessInfoSubmit}
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
    </>
  );
};

export default BusinessSignupForm;
