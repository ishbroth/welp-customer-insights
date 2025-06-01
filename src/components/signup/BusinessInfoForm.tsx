
import { Input } from "@/components/ui/input";
import { BusinessContactSection } from "./BusinessContactSection";
import { BusinessAddressSection } from "./BusinessAddressSection";
import { BusinessTypeSection } from "./BusinessTypeSection";

interface BusinessInfoFormProps {
  businessName: string;
  setBusinessName: (value: string) => void;
  businessEmail: string;
  setBusinessEmail: (value: string) => void;
  businessStreet: string;
  setBusinessStreet: (value: string) => void;
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
}

export const BusinessInfoForm = ({
  businessName,
  setBusinessName,
  businessEmail,
  setBusinessEmail,
  businessStreet,
  setBusinessStreet,
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
  setLicenseNumber
}: BusinessInfoFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium mb-1">Business Name</label>
        <Input
          id="businessName"
          placeholder="e.g. Acme Plumbing"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <BusinessContactSection
        businessEmail={businessEmail}
        setBusinessEmail={setBusinessEmail}
        businessPhone={businessPhone}
        setBusinessPhone={setBusinessPhone}
      />
      
      <BusinessAddressSection
        businessStreet={businessStreet}
        setBusinessStreet={setBusinessStreet}
        businessCity={businessCity}
        setBusinessCity={setBusinessCity}
        businessState={businessState}
        setBusinessState={setBusinessState}
        businessZipCode={businessZipCode}
        setBusinessZipCode={setBusinessZipCode}
      />
      
      <BusinessTypeSection
        businessType={businessType}
        setBusinessType={setBusinessType}
        licenseNumber={licenseNumber}
        setLicenseNumber={setLicenseNumber}
        businessState={businessState}
      />
    </div>
  );
};
