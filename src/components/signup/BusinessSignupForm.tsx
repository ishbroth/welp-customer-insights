
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Building2, AlertCircle } from "lucide-react";
import { verifyBusinessId } from "@/utils/businessVerification";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

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

interface BusinessSignupFormProps {
  step: number;
  setStep: (step: number) => void;
}

const BusinessSignupForm = ({ step, setStep }: BusinessSignupFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  
  // Business form state
  const [businessName, setBusinessName] = useState("");
  const [businessStreet, setBusinessStreet] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessZipCode, setBusinessZipCode] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessType, setBusinessType] = useState("ein");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPassword, setBusinessPassword] = useState("");
  const [businessConfirmPassword, setBusinessConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentVerificationCode, setSentVerificationCode] = useState("");
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationError, setVerificationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTextVerification, setShowTextVerification] = useState(false);
  const [isTextVerificationSent, setIsTextVerificationSent] = useState(false);
  
  // Business verification handlers
  const handleBusinessVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationError("");
    
    // Validate business email
    if (!businessEmail || !businessEmail.includes('@')) {
      setVerificationError("Please provide a valid business email address.");
      setIsVerifying(false);
      return;
    }
    
    try {
      // Use the business verification utility with state-specific verification
      const result = await verifyBusinessId(licenseNumber, businessType, businessState);
      
      if (result.verified) {
        // Store business data for later use in verification success page
        const businessData = {
          name: businessName,
          email: businessEmail,
          phone: businessPhone,
          address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
          licenseNumber: licenseNumber,
          businessType: businessType,
          state: businessState,
          city: businessCity,
          verificationMethod: "license",
          isFullyVerified: true
        };
        
        // Store the verification data in session storage
        sessionStorage.setItem("businessVerificationData", JSON.stringify(businessData));
        
        setVerificationData({
          name: businessName,
          address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
          phone: businessPhone,
          email: businessEmail,
          licenseStatus: "Active",
          licenseType: result.details?.type || "General Business",
          licenseExpiration: result.details?.expirationDate || "2025-12-31"
        });
        setVerificationError("");
      } else {
        // Offer text verification as an alternative
        setVerificationData(null);
        setShowTextVerification(true);
        setVerificationError(result.message || "We couldn't verify your business license. You can proceed with phone verification instead.");
      }
    } catch (error) {
      setVerificationError("An error occurred during verification. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };
  
  const sendTextVerification = async () => {
    if (!businessPhone) {
      setVerificationError("Please provide a valid phone number for verification.");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Generate a random 6-digit code for demo purposes
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentVerificationCode(code);
      
      // In a real app, this would send an SMS via Twilio or similar service
      // For demo purposes, we'll just show the code in a toast
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${businessPhone}. For demo purposes, the code is: ${code}`,
      });
      
      setIsTextVerificationSent(true);
    } catch (error) {
      console.error("Error sending verification code:", error);
      setVerificationError("Failed to send verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  
  const verifyTextCode = () => {
    if (verificationCode === sentVerificationCode) {
      // Store business data with partial verification flag
      const businessData = {
        name: businessName,
        email: businessEmail,
        phone: businessPhone,
        address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
        businessType: businessType,
        state: businessState,
        city: businessCity,
        verificationMethod: "phone",
        isFullyVerified: false
      };
      
      // Store the verification data in session storage
      sessionStorage.setItem("businessVerificationData", JSON.stringify(businessData));
      
      setVerificationData({
        name: businessName,
        address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
        phone: businessPhone,
        email: businessEmail,
        verificationMethod: "phone",
        isFullyVerified: false
      });
      
      setVerificationError("");
      
      toast({
        title: "Phone Verification Successful",
        description: "Your phone has been verified. You can continue with limited access until your business is fully verified.",
      });
    } else {
      setVerificationError("Invalid verification code. Please try again.");
    }
  };
  
  const handleCreateBusinessAccount = async () => {
    if (
      !businessEmail || 
      !businessPassword || 
      businessPassword !== businessConfirmPassword
    ) {
      toast({
        title: "Error",
        description: "Please check your form inputs and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get verification data from session storage
      const verificationDataStr = sessionStorage.getItem("businessVerificationData");
      const verificationInfo = verificationDataStr ? JSON.parse(verificationDataStr) : null;
      
      // Create a business name by joining the business name and type
      const fullBusinessName = `${businessName} (${businessType})`;
      
      const { success, error } = await signup({
        email: businessEmail,
        password: businessPassword,
        name: fullBusinessName,
        phone: businessPhone,
        zipCode: businessZipCode,
        type: "business",
        address: businessStreet,
        city: businessCity,
        state: businessState
      });
      
      if (success) {
        toast({
          title: "Account Created",
          description: verificationInfo?.isFullyVerified 
            ? "Your business account has been fully verified and created successfully!" 
            : "Your business account has been created with limited access. Complete verification for full access.",
        });
        
        // Redirect to business verification success page
        navigate("/business-verification-success");
      } else {
        toast({
          title: "Signup Failed",
          description: error || "An error occurred while creating your account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
    <>
      {step === 1 && !verificationData && !showTextVerification && (
        <form onSubmit={handleBusinessVerification}>
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
            
            {/* Business Email */}
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
            
            {/* Business Street Address */}
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
            
            {/* City */}
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
            
            {/* State Dropdown */}
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
            
            {/* Zip Code */}
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
              <Input
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
                  <SelectItem value="ein">EIN (Employer Identification Number)</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="bar">Bar/Liquor Store</SelectItem>
                  <SelectItem value="attorney">Attorney/Legal Services</SelectItem>
                  <SelectItem value="realtor">Real Estate Agent</SelectItem>
                  <SelectItem value="medical">Medical Professional</SelectItem>
                  <SelectItem value="other">Other Licensed Business</SelectItem>
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
            
            {verificationError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {verificationError}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="welp-button w-full mt-2" 
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Business"}
            </Button>
          </div>
        </form>
      )}

      {step === 1 && showTextVerification && !verificationData && (
        <div className="space-y-4">
          <div className="p-4 border border-amber-300 bg-amber-50 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-amber-800">Business Verification Alternative</h3>
                <p className="text-sm text-amber-700 mt-1">
                  We couldn't verify your business license or EIN. You can continue with phone verification 
                  instead, but you'll have limited access until your business is fully verified.
                </p>
                <div className="mt-2 text-sm text-amber-700">
                  <strong>With limited access, you can:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Search the customer database</li>
                    <li>Purchase one-time access to view specific reviews</li>
                    <li>Subscribe to view all customer reviews</li>
                  </ul>
                </div>
                <div className="mt-2 text-sm text-amber-700">
                  <strong>You will not be able to:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Write or add customer reviews</li>
                  </ul>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  You can complete full verification later through your profile page.
                </p>
              </div>
            </div>
          </div>

          {!isTextVerificationSent ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="businessPhone" className="block text-sm font-medium mb-1">Confirm Phone Number for Verification</label>
                <Input
                  id="businessPhone"
                  placeholder="(555) 123-4567"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="welp-input"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={sendTextVerification}
                  className="welp-button"
                  disabled={isVerifying || !businessPhone}
                >
                  {isVerifying ? "Sending..." : "Send Verification Code"}
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowTextVerification(false);
                    setVerificationError("");
                  }}
                  variant="outline"
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium mb-1">Enter Verification Code</label>
                <Input
                  id="verificationCode"
                  placeholder="6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="welp-input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to {businessPhone}</p>
              </div>
              
              {verificationError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {verificationError}
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button 
                  onClick={verifyTextCode}
                  className="welp-button"
                  disabled={!verificationCode || verificationCode.length !== 6}
                >
                  Verify Code
                </Button>
                
                <Button 
                  onClick={sendTextVerification}
                  variant="outline"
                >
                  Resend Code
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 1 && verificationData && (
        <div className="mt-6 p-4 border-2 border-green-500 bg-green-50 rounded-md">
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            {verificationData.isFullyVerified === false ? "Business Partially Verified" : "Business Verified"}
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {verificationData.name}</p>
            <p><strong>Email:</strong> {verificationData.email}</p>
            <p><strong>Address:</strong> {verificationData.address}</p>
            {verificationData.licenseType && (
              <p><strong>License Type:</strong> {verificationData.licenseType}</p>
            )}
            {verificationData.licenseStatus && (
              <p><strong>License Status:</strong> <span className="text-green-600 font-medium">{verificationData.licenseStatus}</span></p>
            )}
            {verificationData.verificationMethod === "phone" && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                <p className="text-amber-800">
                  <strong>Note:</strong> Your account will have limited functionality until your business is fully verified.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <p className="mb-2">Does this information look correct?</p>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setStep(2)}
                className="welp-button"
              >
                Yes, Continue
              </Button>
              <Button 
                onClick={() => {
                  setVerificationData(null);
                  setVerificationError("");
                  setShowTextVerification(false);
                  setIsTextVerificationSent(false);
                  sessionStorage.removeItem("businessVerificationData");
                }} 
                variant="outline"
              >
                No, Edit Information
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Complete Your Account</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="businessPassword" className="block text-sm font-medium mb-1">Password</label>
              <Input
                id="businessPassword"
                type="password"
                value={businessPassword}
                onChange={(e) => setBusinessPassword(e.target.value)}
                className="welp-input"
                required
              />
            </div>
            
            <div>
              <label htmlFor="businessConfirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                id="businessConfirmPassword"
                type="password"
                value={businessConfirmPassword}
                onChange={(e) => setBusinessConfirmPassword(e.target.value)}
                className="welp-input"
                required
              />
              {businessPassword !== businessConfirmPassword && businessConfirmPassword && (
                <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            
            <div className="pt-4">
              <Button
                onClick={handleCreateBusinessAccount}
                className="welp-button w-full"
                disabled={!businessPassword || businessPassword !== businessConfirmPassword || isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Business Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessSignupForm;
