
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { BusinessInfoForm } from "./BusinessInfoForm";
import { BusinessPasswordSection } from "./BusinessPasswordSection";
import { logger } from "@/utils/logger";

interface BusinessVerificationStepProps {
  businessName: string;
  setBusinessName: (value: string) => void;
  businessEmail: string;
  setBusinessEmail: (value: string) => void;
  businessStreet: string;
  setBusinessStreet: (value: string) => void;
  businessApartmentSuite: string;
  setBusinessApartmentSuite: (value: string) => void;
  businessCity: string;
  setBusinessCity: (value: string) => void;
  businessState: string;
  setBusinessState: (value: string) => void;
  businessZipCode: string;
  setBusinessZipCode: (value: string) => void;
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
  businessType: string;
  setBusinessType: (value: string) => void;
  licenseNumber: string;
  setLicenseNumber: (value: string) => void;
  businessPassword: string;
  setBusinessPassword: (value: string) => void;
  businessConfirmPassword: string;
  setBusinessConfirmPassword: (value: string) => void;
  hasDuplicates: boolean;
  onDuplicateFound: (hasDuplicate: boolean) => void;
  verificationError: string | null;
  isVerifying: boolean;
  isVerified: boolean;
  licenseVerified: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const BusinessVerificationStep = ({
  businessName,
  setBusinessName,
  businessEmail,
  setBusinessEmail,
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
  businessPassword,
  setBusinessPassword,
  businessConfirmPassword,
  setBusinessConfirmPassword,
  hasDuplicates,
  onDuplicateFound,
  verificationError,
  isVerifying,
  isVerified,
  licenseVerified,
  onSubmit
}: BusinessVerificationStepProps) => {
  const componentLogger = logger.withContext('BusinessVerificationStep');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    componentLogger.debug("BUSINESS SIGNUP FORM SUBMISSION");
    componentLogger.debug("Business Type (License Type):", businessType);
    componentLogger.debug("License Number:", licenseNumber);
    componentLogger.debug("Business State:", businessState);
    
    // Validate required fields including passwords
    if (!businessName.trim() || !businessEmail.trim() || !businessStreet.trim() || 
        !businessCity.trim() || !businessState.trim() || !businessZipCode.trim() ||
        !businessPhone.trim() || !businessType.trim() || !licenseNumber.trim() ||
        !businessPassword.trim() || !businessConfirmPassword.trim()) {
      componentLogger.error("Required fields missing for submission");
      return;
    }

    // Validate passwords match
    if (businessPassword !== businessConfirmPassword) {
      componentLogger.error("Passwords do not match");
      return;
    }

    // Validate password length
    if (businessPassword.length < 8) {
      componentLogger.error("Password too short");
      return;
    }

    // Trigger email verification and account creation
    componentLogger.debug("Triggering email verification...");
    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <BusinessInfoForm
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
        onDuplicateFound={onDuplicateFound}
        licenseVerified={licenseVerified}
      />

      <BusinessPasswordSection
        businessPassword={businessPassword}
        setBusinessPassword={setBusinessPassword}
        businessConfirmPassword={businessConfirmPassword}
        setBusinessConfirmPassword={setBusinessConfirmPassword}
      />
      
      {verificationError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mt-4">
          {verificationError}
        </div>
      )}
      
      {hasDuplicates && (
        <Alert className="mt-4 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            An account with this email or phone number already exists. Please sign in to your existing account or use different contact information.
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        className="welp-button w-full mt-6" 
        disabled={isVerifying || hasDuplicates || !businessState.trim() || !businessPhone.trim()}
      >
        {isVerifying ? "Processing..." : "Continue to Email Verification"}
      </Button>

      {isVerifying && (
        <div className="mt-2 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-welp-red mr-2"></div>
            Processing your business registration...
          </div>
        </div>
      )}
    </form>
  );
};
