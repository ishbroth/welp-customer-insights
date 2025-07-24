
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2 } from "lucide-react";
import { BUSINESS_TYPE_OPTIONS } from "./businessFormData";
import { getLicenseLabel, getGuidanceMessage } from "./licenseUtils";
import { useRealTimeLicenseVerification } from "@/hooks/useRealTimeLicenseVerification";

interface BusinessLicenseSectionProps {
  businessType: string;
  setBusinessType: (value: string) => void;
  licenseNumber: string;
  setLicenseNumber: (value: string) => void;
  businessState: string;
  licenseVerified?: boolean;
}

export const BusinessLicenseSection = ({
  businessType,
  setBusinessType,
  licenseNumber,
  setLicenseNumber,
  businessState,
  licenseVerified = false
}: BusinessLicenseSectionProps) => {
  const {
    isVerifying,
    isVerified,
    verificationResult,
    hasAttempted
  } = useRealTimeLicenseVerification(licenseNumber, businessType, businessState);

  const licenseLabel = getLicenseLabel(businessType);
  const guidanceMessage = getGuidanceMessage(businessState, businessType);

  const showVerificationIcon = licenseNumber.trim().length >= 4 && businessType && businessState;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium mb-1">
          Business Type <span className="text-red-500">*</span>
        </label>
        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger className="welp-input">
            <SelectValue placeholder="Select your business type" />
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
        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
          {licenseLabel} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="licenseNumber"
            type="text"
            placeholder={`Enter your ${licenseLabel.toLowerCase()}`}
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="welp-input pr-10"
            required
          />
          {showVerificationIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : isVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : hasAttempted ? (
                <div className="h-4 w-4 rounded-full bg-gray-300" />
              ) : null}
            </div>
          )}
        </div>
        
        {guidanceMessage && (
          <p className="text-xs text-blue-600 mt-1">{guidanceMessage}</p>
        )}
        
        {isVerified && verificationResult && (
          <p className="text-xs text-green-600 mt-1">
            ✓ License verified with {verificationResult.details?.issuingAuthority || 'state database'}
          </p>
        )}
        
        {hasAttempted && !isVerified && !isVerifying && verificationResult && (
          <p className="text-xs text-gray-500 mt-1">
            License will be verified manually after account creation
          </p>
        )}
      </div>
    </div>
  );
};
