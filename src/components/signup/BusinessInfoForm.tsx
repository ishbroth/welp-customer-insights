import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Array of US states for the dropdown
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

// Business type options - alphabetized and concise
const BUSINESS_TYPE_OPTIONS = [
  { value: "contractor", label: "Contractors" },
  { value: "attorney", label: "Law/Legal" },
  { value: "bar", label: "Liquor Licenses" },
  { value: "medical", label: "Medical/Dental" },
  { value: "realtor", label: "Real Estate" },
  { value: "other", label: "Vendors/Sellers" }
].sort((a, b) => a.label.localeCompare(b.label));

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
  
  // Get label for the license input based on selected business type
  const getLicenseLabel = () => {
    switch (businessType) {
      case "ein":
        return "EIN";
      case "contractor":
        return "Contractor License Number";
      case "restaurant":
        return "Restaurant License Number";
      case "bar":
        return "Liquor License Number";
      case "attorney":
        return "Bar Association Number";
      case "realtor":
        return "Real Estate License Number";
      case "medical":
        return "Medical License Number";
      default:
        return "License Number / EIN";
    }
  };

  // Get guidance message based on selected state and business type
  const getGuidanceMessage = () => {
    if (!businessState || !businessType || businessType === "ein") {
      return "";
    }
    
    switch(businessType) {
      case "contractor":
        if (businessState === "California") {
          return "California contractor licenses typically have 6-8 digits";
        } else if (businessState === "Florida") {
          return "Florida contractor licenses typically start with CBC, CCC, CFC, CGC, or CRC followed by 6 digits";
        }
        break;
      case "bar":
        if (businessState === "California") {
          return "California liquor licenses typically have 6 digits";
        } else if (businessState === "New York") {
          return "New York liquor licenses typically have 8 digits";
        }
        break;
      case "attorney":
        if (businessState === "California") {
          return "California bar numbers typically have 6 digits";
        } else if (businessState === "New York") {
          return "New York bar numbers typically have 7 digits";
        }
        break;
      case "realtor":
        if (businessState === "Florida") {
          return "Florida real estate licenses typically start with BK or SL followed by 7 digits";
        }
        break;
    }
    
    return "";
  };

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
      
      <div>
        <label htmlFor="businessEmail" className="block text-sm font-medium mb-1">Business Email</label>
        <Input
          id="businessEmail"
          type="email"
          placeholder="business@example.com"
          value={businessEmail}
          onChange={(e) => setBusinessEmail(e.target.value)}
          className="welp-input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
      </div>
      
      <div>
        <label htmlFor="businessStreet" className="block text-sm font-medium mb-1">Business Street Address</label>
        <Input
          id="businessStreet"
          placeholder="123 Business St"
          value={businessStreet}
          onChange={(e) => setBusinessStreet(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="businessCity" className="block text-sm font-medium mb-1">City</label>
        <Input
          id="businessCity"
          placeholder="City"
          value={businessCity}
          onChange={(e) => setBusinessCity(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="businessState" className="block text-sm font-medium mb-1">State</label>
        <Select value={businessState} onValueChange={setBusinessState}>
          <SelectTrigger className="welp-input">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            {US_STATES.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="businessZipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
        <Input
          id="businessZipCode"
          placeholder="12345"
          value={businessZipCode}
          onChange={(e) => setBusinessZipCode(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="businessPhone" className="block text-sm font-medium mb-1">Business Phone</label>
        <PhoneInput
          id="businessPhone"
          placeholder="(555) 123-4567"
          value={businessPhone}
          onChange={(e) => setBusinessPhone(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
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
        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">{getLicenseLabel()}</label>
        <Input
          id="licenseNumber"
          placeholder={`Enter your ${getLicenseLabel()}`}
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="welp-input"
          required
        />
        {getGuidanceMessage() && (
          <p className="text-xs text-gray-500 mt-1">{getGuidanceMessage()}</p>
        )}
      </div>
    </div>
  );
};
