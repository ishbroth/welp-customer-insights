
import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserRound, Building2 } from "lucide-react";
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

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAccountType = searchParams.get("type") === "customer" ? "customer" : "business";
  const [accountType, setAccountType] = useState<"business" | "customer">(initialAccountType);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { signup } = useAuth();
  
  // Business form state
  const [businessName, setBusinessName] = useState("");
  // Address broken down into separate fields
  const [businessStreet, setBusinessStreet] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessZipCode, setBusinessZipCode] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessType, setBusinessType] = useState("ein"); // Business type state
  const [licenseNumber, setLicenseNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState(""); // Already defined
  const [businessPassword, setBusinessPassword] = useState("");
  const [businessConfirmPassword, setBusinessConfirmPassword] = useState("");
  
  // Customer form state
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  // New customer address fields
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState("");
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationError, setVerificationError] = useState("");
  
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset form and steps when account type changes
    setStep(1);
    setVerificationData(null);
    setVerificationError("");
    setIsPhoneVerifying(false);
  }, [accountType]);

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
          city: businessCity
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
        setVerificationData(null);
        setVerificationError(result.message || "We couldn't verify your business. Please check your information and try again.");
      }
    } catch (error) {
      setVerificationError("An error occurred during verification. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
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
      // Create a business name by joining the business name and type
      const fullBusinessName = `${businessName} (${businessType})`;
      
      const { success, error } = await signup({
        email: businessEmail,
        password: businessPassword,
        name: fullBusinessName,
        phone: businessPhone,
        zipCode: businessZipCode,
        type: "business"
      });
      
      if (success) {
        toast({
          title: "Account Created",
          description: "Your business account has been created successfully!",
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

  const handleCreateCustomerAccount = async () => {
    // Validate customer information
    if (
      !customerFirstName || 
      !customerLastName || 
      !customerPhone || 
      !customerEmail || 
      !customerPassword ||
      customerPassword !== customerConfirmPassword
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields and ensure passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create customer account with Supabase
      const { success, error } = await signup({
        email: customerEmail,
        password: customerPassword,
        name: `${customerFirstName} ${customerLastName}`,
        phone: customerPhone,
        zipCode: customerZipCode,
        address: customerStreet,
        city: customerCity,
        state: customerState,
        type: "customer"
      });
      
      if (success) {
        // Store verification data in session storage for the onboarding flow
        const customerData = {
          firstName: customerFirstName,
          lastName: customerLastName,
          phone: customerPhone,
          address: customerStreet,
          city: customerCity,
          state: customerState,
          zipCode: customerZipCode,
          email: customerEmail
        };
        
        sessionStorage.setItem("customerSignupData", JSON.stringify(customerData));
        
        // Generate a random 6-digit verification code for demo purposes
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem("phoneVerificationCode", verificationCode);
        
        // Show a toast indicating that verification is needed
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${customerPhone}. For demo purposes, the code is: ${verificationCode}`,
        });
        
        // Redirect to the verification page
        navigate("/verify-phone");
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Create Your Welp. Account</h1>
            
            <Tabs 
              defaultValue={initialAccountType} 
              onValueChange={(value) => setAccountType(value as "business" | "customer")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="business" className="data-[state=active]:bg-welp-primary data-[state=active]:text-white">
                  <Building2 className="mr-2 h-4 w-4" /> Business Owner
                </TabsTrigger>
                <TabsTrigger value="customer" className="data-[state=active]:bg-welp-primary data-[state=active]:text-white">
                  <UserRound className="mr-2 h-4 w-4" /> Customer
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="business">
                {step === 1 && (
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

                {step === 1 && verificationData && (
                  <div className="mt-6 p-4 border-2 border-green-500 bg-green-50 rounded-md">
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Business Verified</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {verificationData.name}</p>
                      <p><strong>Email:</strong> {verificationData.email}</p>
                      <p><strong>Address:</strong> {verificationData.address}</p>
                      <p><strong>License Type:</strong> {verificationData.licenseType}</p>
                      <p><strong>License Status:</strong> <span className="text-green-600 font-medium">{verificationData.licenseStatus}</span></p>
                    </div>
                    
                    <div className="mt-4">
                      <p className="mb-2">Does this information look correct?</p>
                      <div className="flex space-x-3">
                        <Button 
                          onClick={() => navigate("/business-verification-success")}
                          className="welp-button"
                        >
                          Yes, Continue
                        </Button>
                        <Button 
                          onClick={() => {
                            setVerificationData(null);
                            setVerificationError("");
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
                        <label htmlFor="businessEmail" className="block text-sm font-medium mb-1">Email Address</label>
                        <Input
                          id="businessEmail"
                          type="email"
                          placeholder="business@example.com"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          className="welp-input"
                          required
                        />
                      </div>
                      
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
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          onClick={handleCreateBusinessAccount}
                          className="welp-button w-full"
                          disabled={!businessEmail || !businessPassword || businessPassword !== businessConfirmPassword || isSubmitting}
                        >
                          {isSubmitting ? "Creating Account..." : "Create Business Account"}
                        </Button>
                        
                        {businessPassword !== businessConfirmPassword && businessConfirmPassword && (
                          <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="customer">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Create Customer Account</h2>
                  
                  <div>
                    <label htmlFor="customerFirstName" className="block text-sm font-medium mb-1">First Name</label>
                    <Input
                      id="customerFirstName"
                      placeholder="John"
                      value={customerFirstName}
                      onChange={(e) => setCustomerFirstName(e.target.value)}
                      className="welp-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerLastName" className="block text-sm font-medium mb-1">Last Name</label>
                    <Input
                      id="customerLastName"
                      placeholder="Smith"
                      value={customerLastName}
                      onChange={(e) => setCustomerLastName(e.target.value)}
                      className="welp-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
                    <Input
                      id="customerPhone"
                      placeholder="(555) 123-4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="welp-input"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
                  </div>
                  
                  {/* New address fields for customer */}
                  <div>
                    <label htmlFor="customerStreet" className="block text-sm font-medium mb-1">Street Address</label>
                    <Input
                      id="customerStreet"
                      placeholder="123 Main St"
                      value={customerStreet}
                      onChange={(e) => setCustomerStreet(e.target.value)}
                      className="welp-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerCity" className="block text-sm font-medium mb-1">City</label>
                    <Input
                      id="customerCity"
                      placeholder="New York"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="welp-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerState" className="block text-sm font-medium mb-1">State</label>
                    <Select value={customerState} onValueChange={setCustomerState}>
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
                    <label htmlFor="customerZipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
                    <Input
                      id="customerZipCode"
                      placeholder="12345"
                      value={customerZipCode}
                      onChange={(e) => setCustomerZipCode(e.target.value)}
                      className="welp-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">Email Address</label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="welp-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerPassword" className="block text-sm font-medium mb-1">Password</label>
                    <Input
                      id="customerPassword"
                      type="password"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      className="welp-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerConfirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
                    <Input
                      id="customerConfirmPassword"
                      type="password"
                      value={customerConfirmPassword}
                      onChange={(e) => setCustomerConfirmPassword(e.target.value)}
                      className="welp-input"
                      required
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      onClick={handleCreateCustomerAccount}
                      className="welp-button w-full"
                      disabled={
                        !customerFirstName || 
                        !customerLastName || 
                        !customerPhone || 
                        !customerEmail || 
                        !customerPassword || 
                        customerPassword !== customerConfirmPassword ||
                        isSubmitting
                      }
                    >
                      {isSubmitting ? "Creating Account..." : "Create Customer Account"}
                    </Button>
                    
                    {customerPassword !== customerConfirmPassword && customerConfirmPassword && (
                      <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account? <Link to="/login" className="text-welp-primary hover:underline">Log In</Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
