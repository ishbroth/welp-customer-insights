
import { Input } from "@/components/ui/input";
import { BusinessAddressSection } from "./BusinessAddressSection";
import BusinessTypeSelect from "@/components/search/BusinessTypeSelect";
import { PhoneInput } from "@/components/ui/phone-input";
import { BusinessContactSection } from "./BusinessContactSection";

interface BusinessInfoFormProps {
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
  onDuplicateFound: (hasDuplicate: boolean) => void;
}

export const BusinessInfoForm = ({
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
  onDuplicateFound
}: BusinessInfoFormProps) => {

  return (
    <div className="space-y-6">
      <BusinessAddressSection
        businessName={businessName}
        setBusinessName={setBusinessName}
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
      />
      
      <BusinessContactSection
        businessEmail={businessEmail}
        setBusinessEmail={setBusinessEmail}
        businessPhone={businessPhone}
        setBusinessPhone={setBusinessPhone}
        businessName={businessName}
        businessAddress={`${businessStreet} ${businessCity} ${businessState} ${businessZipCode}`.trim()}
        onDuplicateFound={onDuplicateFound}
      />
      
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium mb-1">
          Business Type <span className="text-red-500">*</span>
        </label>
        <BusinessTypeSelect
          value={businessType}
          onValueChange={setBusinessType}
        />
        {!businessType && (
          <p className="text-sm text-red-500 mt-1">Please select a business type</p>
        )}
      </div>
      
      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
          License Number <span className="text-red-500">*</span>
        </label>
        <Input
          id="licenseNumber"
          type="text"
          placeholder="Your business license number"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="welp-input"
          required
        />
      </div>
    </div>
  );
};
