
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
import { validatePhoneNumber, sendSmsVerification } from "@/utils/phoneVerification";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAccountType = searchParams.get("type") === "customer" ? "customer" : "business";
  const [accountType, setAccountType] = useState<"business" | "customer">(initialAccountType);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { signUp, useMockData } = useAuth();
  
  // Business form state
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPassword, setBusinessPassword] = useState("");
  const [businessConfirmPassword, setBusinessConfirmPassword] = useState("");
  
  // Customer form state
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState("");
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationError, setVerificationError] = useState("");
  
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);

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
    
    try {
      // Use the business verification utility with mock data
      const result = await verifyBusinessId(licenseNumber);
      
      if (result.verified) {
        setVerificationData({
          name: businessName,
          address: businessAddress,
          phone: businessPhone,
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

  const initiateCustomerVerification = async () => {
    // Validate customer information
    if (!customerFirstName || !customerLastName || !customerPhone || !customerEmail || !customerPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (customerPassword !== customerConfirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Your passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate phone number format
    if (!validatePhoneNumber(customerPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    
    // Store customer data in session storage for the verification flow
    const customerData = {
      firstName: customerFirstName,
      lastName: customerLastName,
      phone: customerPhone,
      zipCode: customerZipCode,
      email: customerEmail,
      password: customerPassword,
      type: "customer",
    };
    
    sessionStorage.setItem("customerSignupData", JSON.stringify(customerData));
    
    // If we're using mock data, just navigate to verification page
    if (useMockData) {
      navigate("/verify-phone");
      return;
    }
    
    // If we're using real data, send SMS verification
    try {
      setIsPhoneVerifying(true);
      const response = await sendSmsVerification(customerPhone);
      
      if (response.success) {
        toast({
          title: "Verification Code Sent",
          description: "A verification code has been sent to your phone.",
        });
        navigate("/verify-phone");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("SMS verification error:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPhoneVerifying(false);
    }
  };

  const handleCreateBusinessAccount = async () => {
    if (!businessEmail || !businessPassword || businessPassword !== businessConfirmPassword) {
      toast({
        title: "Invalid Information",
        description: "Please check your email and password.",
        variant: "destructive",
      });
      return;
    }
    
    const businessData = {
      type: "business",
      business_name: businessName,
      first_name: businessName.split(' ')[0] || '',
      last_name: businessName.split(' ').slice(1).join(' ') || '',
      phone: businessPhone,
      address: businessAddress,
      license_number: licenseNumber
    };
    
    if (useMockData) {
      // Using mock data
      toast({
        title: "Account Created",
        description: "Your business account has been created successfully!",
      });
      
      setTimeout(() => {
        navigate("/business-verification-success");
      }, 1000);
    } else {
      // Using Supabase
      const { success, error } = await signUp(businessEmail, businessPassword, businessData);
      
      if (success) {
        toast({
          title: "Account Created",
          description: "Your business account has been created successfully!",
        });
        navigate("/business-verification-success");
      } else {
        toast({
          title: "Signup Error",
          description: error || "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Create Your Welp! Account</h1>
            
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
                        <p className="text-xs text-gray-500 mt-1">Use "Acme" for demo verification to succeed</p>
                      </div>
                      
                      <div>
                        <label htmlFor="businessAddress" className="block text-sm font-medium mb-1">Business Address</label>
                        <Input
                          id="businessAddress"
                          placeholder="123 Business St, City, State, ZIP"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
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
                        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">License Number / EIN</label>
                        <Input
                          id="licenseNumber"
                          placeholder="e.g. 123456789 or 12-3456789"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="welp-input"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter your business license, contractor license, or EIN</p>
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
                      <p><strong>Address:</strong> {verificationData.address}</p>
                      <p><strong>License Type:</strong> {verificationData.licenseType}</p>
                      <p><strong>License Status:</strong> <span className="text-green-600 font-medium">{verificationData.licenseStatus}</span></p>
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
                          disabled={!businessEmail || !businessPassword || businessPassword !== businessConfirmPassword}
                        >
                          Create Business Account
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
                      onClick={initiateCustomerVerification}
                      className="welp-button w-full"
                      disabled={
                        !customerFirstName || 
                        !customerLastName || 
                        !customerPhone || 
                        !customerEmail || 
                        !customerPassword || 
                        customerPassword !== customerConfirmPassword ||
                        isPhoneVerifying
                      }
                    >
                      {isPhoneVerifying ? "Sending Verification..." : "Create Customer Account"}
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

            {/* Toggle for Mock/Real Data */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={!useMockData}
                    onChange={() => {
                      // Toggle to demo mode
                      const { setUseMockData } = useAuth();
                      setUseMockData(!useMockData);
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {useMockData ? "Use Mock Data (Demo)" : "Use Real Database"}
                  </span>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
