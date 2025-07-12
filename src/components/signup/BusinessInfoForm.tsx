
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { verifyBusinessId } from "@/utils/businessVerification";
import LicenseVerificationPopup from "./LicenseVerificationPopup";

const businessTypes = [
  { value: "contractor", label: "Contractor" },
  { value: "realtor", label: "Real Estate" },
  { value: "attorney", label: "Attorney/Legal" },
  { value: "medical", label: "Medical/Healthcare" },
  { value: "restaurant", label: "Restaurant/Food Service" },
  { value: "bar", label: "Bar/Liquor License" },
  { value: "auto", label: "Automotive" },
  { value: "insurance", label: "Insurance" },
  { value: "energy", label: "Energy/Solar" },
  { value: "rentals", label: "Equipment Rentals" },
  { value: "retail", label: "Retail" },
  { value: "ein", label: "EIN Only" },
  { value: "other", label: "Other" }
];

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
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);

  // Check for duplicates when email or phone changes
  useEffect(() => {
    const checkDuplicates = async () => {
      if (!businessEmail && !businessPhone) return;
      
      setIsCheckingDuplicates(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('check-duplicates', {
          body: {
            email: businessEmail,
            phone: businessPhone
          }
        });

        if (error) {
          console.error("Error checking duplicates:", error);
          return;
        }

        const hasDuplicates = data?.emailExists || data?.phoneExists;
        onDuplicateFound(hasDuplicates);
        
        if (hasDuplicates) {
          toast.error("An account with this email or phone number already exists");
        }
      } catch (error) {
        console.error("Error checking duplicates:", error);
      } finally {
        setIsCheckingDuplicates(false);
      }
    };

    const timeoutId = setTimeout(checkDuplicates, 500);
    return () => clearTimeout(timeoutId);
  }, [businessEmail, businessPhone, onDuplicateFound]);

  // License verification when license number and business type change
  useEffect(() => {
    const verifyLicense = async () => {
      if (!licenseNumber || !businessType || licenseNumber.length < 3) {
        setVerificationStatus('idle');
        return;
      }

      setVerificationStatus('verifying');
      
      try {
        const result = await verifyBusinessId(licenseNumber, businessType, businessState);
        setVerificationResult(result);
        
        if (result.verified) {
          setVerificationStatus('verified');
          setShowVerificationPopup(true);
          toast.success("License verified successfully!");
        } else {
          setVerificationStatus('failed');
        }
      } catch (error) {
        console.error("License verification error:", error);
        setVerificationStatus('failed');
      }
    };

    const timeoutId = setTimeout(verifyLicense, 1000);
    return () => clearTimeout(timeoutId);
  }, [licenseNumber, businessType, businessState]);

  const getVerificationIcon = () => {
    switch (verificationStatus) {
      case 'verifying':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="welp-input"
              required
            />
          </div>

          <div>
            <Label htmlFor="businessEmail">Business Email *</Label>
            <div className="relative">
              <Input
                id="businessEmail"
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="welp-input"
                required
              />
              {isCheckingDuplicates && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger className="welp-input">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="licenseNumber">License Number / EIN *</Label>
            <div className="relative">
              <Input
                id="licenseNumber"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="welp-input pr-10"
                placeholder="Enter license number or EIN"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getVerificationIcon()}
              </div>
            </div>
            {verificationStatus === 'failed' && (
              <p className="text-sm text-red-600 mt-1">
                Could not verify license. You can continue with manual verification.
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="businessStreet">Street Address *</Label>
          <Input
            id="businessStreet"
            value={businessStreet}
            onChange={(e) => setBusinessStreet(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="businessApartmentSuite">Apartment/Suite (Optional)</Label>
          <Input
            id="businessApartmentSuite"
            value={businessApartmentSuite}
            onChange={(e) => setBusinessApartmentSuite(e.target.value)}
            className="welp-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="businessCity">City *</Label>
            <Input
              id="businessCity"
              value={businessCity}
              onChange={(e) => setBusinessCity(e.target.value)}
              className="welp-input"
              required
            />
          </div>

          <div>
            <Label htmlFor="businessState">State *</Label>
            <Select value={businessState} onValueChange={setBusinessState}>
              <SelectTrigger className="welp-input">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AL">Alabama</SelectItem>
                <SelectItem value="AK">Alaska</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="AR">Arkansas</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="CO">Colorado</SelectItem>
                <SelectItem value="CT">Connecticut</SelectItem>
                <SelectItem value="DE">Delaware</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="GA">Georgia</SelectItem>
                <SelectItem value="HI">Hawaii</SelectItem>
                <SelectItem value="ID">Idaho</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
                <SelectItem value="IN">Indiana</SelectItem>
                <SelectItem value="IA">Iowa</SelectItem>
                <SelectItem value="KS">Kansas</SelectItem>
                <SelectItem value="KY">Kentucky</SelectItem>
                <SelectItem value="LA">Louisiana</SelectItem>
                <SelectItem value="ME">Maine</SelectItem>
                <SelectItem value="MD">Maryland</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
                <SelectItem value="MI">Michigan</SelectItem>
                <SelectItem value="MN">Minnesota</SelectItem>
                <SelectItem value="MS">Mississippi</SelectItem>
                <SelectItem value="MO">Missouri</SelectItem>
                <SelectItem value="MT">Montana</SelectItem>
                <SelectItem value="NE">Nebraska</SelectItem>
                <SelectItem value="NV">Nevada</SelectItem>
                <SelectItem value="NH">New Hampshire</SelectItem>
                <SelectItem value="NJ">New Jersey</SelectItem>
                <SelectItem value="NM">New Mexico</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="NC">North Carolina</SelectItem>
                <SelectItem value="ND">North Dakota</SelectItem>
                <SelectItem value="OH">Ohio</SelectItem>
                <SelectItem value="OK">Oklahoma</SelectItem>
                <SelectItem value="OR">Oregon</SelectItem>
                <SelectItem value="PA">Pennsylvania</SelectItem>
                <SelectItem value="RI">Rhode Island</SelectItem>
                <SelectItem value="SC">South Carolina</SelectItem>
                <SelectItem value="SD">South Dakota</SelectItem>
                <SelectItem value="TN">Tennessee</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="UT">Utah</SelectItem>
                <SelectItem value="VT">Vermont</SelectItem>
                <SelectItem value="VA">Virginia</SelectItem>
                <SelectItem value="WA">Washington</SelectItem>
                <SelectItem value="WV">West Virginia</SelectItem>
                <SelectItem value="WI">Wisconsin</SelectItem>
                <SelectItem value="WY">Wyoming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="businessZipCode">Zip Code *</Label>
            <Input
              id="businessZipCode"
              value={businessZipCode}
              onChange={(e) => setBusinessZipCode(e.target.value)}
              className="welp-input"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="businessPhone">Business Phone *</Label>
          <div className="relative">
            <Input
              id="businessPhone"
              type="tel"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              className="welp-input"
              placeholder="(555) 123-4567"
              required
            />
            {isCheckingDuplicates && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <LicenseVerificationPopup
        isOpen={showVerificationPopup}
        onClose={() => setShowVerificationPopup(false)}
        verificationResult={verificationResult}
        businessName={businessName}
        licenseNumber={licenseNumber}
      />
    </>
  );
};
