
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUSINESS_TYPE_OPTIONS, US_STATES } from "@/components/signup/businessFormData";

interface FormData {
  businessName: string;
  primaryLicense: string;
  licenseState: string;
  licenseType: string;
  businessType: string;
  businessSubcategory: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  additionalLicenses: string;
  additionalInfo: string;
}

interface BasicLicenseFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

const BasicLicenseFields = ({ formData, onInputChange }: BasicLicenseFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => onInputChange("businessName", e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="primaryLicense">Primary License Number *</Label>
        <Input
          id="primaryLicense"
          value={formData.primaryLicense}
          onChange={(e) => onInputChange("primaryLicense", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="businessType">Business Type *</Label>
        <Select value={formData.businessType} onValueChange={(value) => onInputChange("businessType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {BUSINESS_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="licenseState">License State *</Label>
        <Select value={formData.licenseState} onValueChange={(value) => onInputChange("licenseState", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {US_STATES.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default BasicLicenseFields;
