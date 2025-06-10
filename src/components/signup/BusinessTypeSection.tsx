
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessTypeSectionProps {
  businessType: string;
  setBusinessType: (value: string) => void;
  licenseNumber: string;
  setLicenseNumber: (value: string) => void;
  businessState: string;
}

export const BusinessTypeSection = ({
  businessType,
  setBusinessType,
  licenseNumber,
  setLicenseNumber,
  businessState,
}: BusinessTypeSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium mb-1">License Type</label>
        <Select value={businessType} onValueChange={setBusinessType} required>
          <SelectTrigger className="welp-input">
            <SelectValue placeholder="Select license type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ein">EIN</SelectItem>
            <SelectItem value="contractor">Contractor</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="liquor">Liquor</SelectItem>
            <SelectItem value="general">General Business</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
          License Number
          {businessState && (
            <span className="text-sm text-gray-500 ml-1">({businessState})</span>
          )}
        </label>
        <Input
          id="licenseNumber"
          type="text"
          placeholder="Enter your license number"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="welp-input"
          required
        />
      </div>
    </div>
  );
};
