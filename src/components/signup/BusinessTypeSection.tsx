
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BUSINESS_TYPE_OPTIONS } from "./businessFormData";
import { getLicenseLabel, getGuidanceMessage } from "./licenseUtils";

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
  businessState
}: BusinessTypeSectionProps) => {
  const licenseLabel = getLicenseLabel(businessType);
  const guidanceMessage = getGuidanceMessage(businessState, businessType);

  return (
    <>
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium mb-1">Business Type</label>
        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger className="welp-input">
            <SelectValue placeholder="Select Business Type" />
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
        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">{licenseLabel}</label>
        <Input
          id="licenseNumber"
          placeholder={`Enter your ${licenseLabel}`}
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="welp-input"
          required
        />
        {guidanceMessage && (
          <p className="text-xs text-gray-500 mt-1">{guidanceMessage}</p>
        )}
      </div>
    </>
  );
};
