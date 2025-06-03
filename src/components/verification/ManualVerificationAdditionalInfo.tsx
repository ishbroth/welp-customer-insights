
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

interface ManualVerificationAdditionalInfoProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

const ManualVerificationAdditionalInfo = ({ 
  formData, 
  onInputChange
}: ManualVerificationAdditionalInfoProps) => {
  return (
    <>
      <div className="md:col-span-2">
        <Label htmlFor="additionalLicenses">Additional Licenses or Certifications</Label>
        <Textarea
          id="additionalLicenses"
          value={formData.additionalLicenses}
          onChange={(e) => onInputChange("additionalLicenses", e.target.value)}
          placeholder="List any additional licenses, certifications, or credentials..."
          rows={3}
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="additionalInfo">Additional Information</Label>
        <Textarea
          id="additionalInfo"
          value={formData.additionalInfo}
          onChange={(e) => onInputChange("additionalInfo", e.target.value)}
          placeholder="Any other information you think would be helpful for verification..."
          rows={3}
        />
      </div>
    </>
  );
};

export default ManualVerificationAdditionalInfo;
