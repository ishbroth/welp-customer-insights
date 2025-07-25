
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
  "Wisconsin", "Wyoming"
];

interface FormData {
  businessName: string;
  primaryLicense: string;
  licenseState: string;
}

interface BasicLicenseFieldsProps {
  formData: Pick<FormData, 'businessName' | 'primaryLicense' | 'licenseState'>;
  onInputChange: (field: string, value: string) => void;
}

const BasicLicenseFields = ({ formData, onInputChange }: BasicLicenseFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          type="text"
          value={formData.businessName}
          onChange={(e) => onInputChange("businessName", e.target.value)}
          placeholder="Enter your business name"
          required
        />
      </div>

      <div>
        <Label htmlFor="primaryLicense">Primary License Number *</Label>
        <Input
          id="primaryLicense"
          type="text"
          value={formData.primaryLicense}
          onChange={(e) => onInputChange("primaryLicense", e.target.value)}
          placeholder="Enter your license number"
          required
        />
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
    </div>
  );
};

export default BasicLicenseFields;
