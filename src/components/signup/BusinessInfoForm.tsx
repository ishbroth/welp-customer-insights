
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessAddressSection } from "./BusinessAddressSection";
import { PhoneInput } from "@/components/ui/phone-input";
import { BusinessContactSection } from "./BusinessContactSection";
import { BUSINESS_TYPE_OPTIONS } from "./businessFormData";

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
          License Type/EIN <span className="text-red-500">*</span>
        </label>
        <Select value={businessType} onValueChange={setBusinessType} required>
          <SelectTrigger className="welp-input">
            <SelectValue placeholder="Select license type or EIN" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!businessType && (
          <p className="text-sm text-red-500 mt-1">Please select a license type</p>
        )}
      </div>
      
      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
          License Number <span className="text-red-500">*</span>
        </label>
        <Input
          id="licenseNumber"
          type="text"
          placeholder="Your business license number or EIN"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="welp-input"
          required
        />
      </div>
    </div>
  );
};
