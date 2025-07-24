
import { useAuth } from "@/contexts/auth";
import { BusinessVerificationStep } from "./BusinessVerificationStep";
import { useBusinessAccountCreation } from "@/hooks/useBusinessAccountCreation";
import { useBusinessFormState } from "@/hooks/useBusinessFormState";
import { useRealTimeLicenseVerification } from "@/hooks/useRealTimeLicenseVerification";

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

  // Get real-time license verification status
  const { isVerified: licenseVerified } = useRealTimeLicenseVerification(
    licenseNumber,
    businessType,
    businessState
  );
  
  // Business form validation and submission
  const handleBusinessFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!businessName.trim() || !businessEmail.trim() || !businessStreet.trim() || 
        !businessCity.trim() || !businessState.trim() || !businessZipCode.trim() || 
        !businessPhone.trim() || !businessType.trim() || !licenseNumber.trim() ||
        !businessPassword.trim() || !businessConfirmPassword.trim()) {
      return;
    }
    
    // Block if duplicates exist
    if (hasDuplicates) {
      return;
    }
    
    // Proceed with email verification and account creation
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
      businessPassword={businessPassword}
      setBusinessPassword={setBusinessPassword}
      businessConfirmPassword={businessConfirmPassword}
      setBusinessConfirmPassword={setBusinessConfirmPassword}
      hasDuplicates={hasDuplicates}
      onDuplicateFound={setHasDuplicates}
      verificationError=""
      isVerifying={isSubmitting}
      isVerified={licenseVerified}
      licenseVerified={licenseVerified}
      onSubmit={handleBusinessFormSubmit}
    />
  );
};

export default BusinessSignupForm;
