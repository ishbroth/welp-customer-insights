
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { BusinessInfoForm } from "./BusinessInfoForm";

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
  hasDuplicates: boolean;
  onDuplicateFound: (hasDuplicate: boolean) => void;
  verificationError: string | null;
  isVerifying: boolean;
  isVerified: boolean;
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
  hasDuplicates,
  onDuplicateFound,
  verificationError,
  isVerifying,
  isVerified,
  onSubmit
}: BusinessVerificationStepProps) => {
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields including state
    if (!businessName.trim() || !businessEmail.trim() || !businessStreet.trim() || 
        !businessCity.trim() || !businessState.trim() || !businessZipCode.trim() || 
        !businessPhone.trim() || !businessType.trim() || !licenseNumber.trim()) {
      return;
    }
    
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
        disabled={isVerifying || hasDuplicates || !businessState.trim()}
      >
        {isVerifying ? "Processing..." : "Continue to Password Setup"}
      </Button>
    </form>
  );
};
