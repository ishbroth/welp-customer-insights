
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resendVerificationCode } from "@/lib/utils";
import { useVerificationTimer } from "@/hooks/useVerificationTimer";

const BusinessVerificationSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  
  const { 
    isDisabled: isResendDisabled, 
    timer, 
    startTimer 
  } = useVerificationTimer();
  
  // Get data from sessionStorage if available
  const [businessData, setBusinessData] = useState(() => {
    const storedData = sessionStorage.getItem("businessVerificationData");
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  });

  // If no business data is found, redirect to signup page
  useEffect(() => {
    if (!businessData) {
      toast({
        title: "Missing business data",
        description: "Please complete business verification first.",
        variant: "destructive"
      });
      navigate('/signup?type=business');
    } else {
      // Pre-fill the phone number if available
      if (businessData.phone) {
        setPhoneNumber(businessData.phone);
      }
    }
  }, [businessData, navigate, toast]);

  const handleSendVerification = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { success, error } = await resendVerificationCode({ phoneNumber });
      
      if (success) {
        startTimer();
        setVerificationSent(true);
        
        // Update the business data with the phone number
        const updatedBusinessData = { ...businessData, phone: phoneNumber };
        sessionStorage.setItem("businessVerificationData", JSON.stringify(updatedBusinessData));
        
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${phoneNumber}.`,
        });
        
        // Redirect to the verification page with necessary parameters
        const params = new URLSearchParams({
          email: businessData.email,
          password: businessData.password || "",
          name: businessData.name,
          phone: phoneNumber,
          accountType: "business",
          businessName: businessData.businessName || businessData.name,
          address: businessData.address || "",
          city: businessData.city || "",
          state: businessData.state || "",
          zipCode: businessData.zipCode || ""
        });
        
        navigate(`/verify-phone?${params.toString()}`);
      } else {
        toast({
          title: "Error",
          description: error || "Failed to send verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">
              {businessData?.isFullyVerified === false ? "Business Partially Verified" : "Business Verified!"}
            </h1>
            
            <p className="text-center text-gray-600 mb-6">
              Complete your account setup by verifying your phone number.
            </p>

            {businessData?.isFullyVerified === false && (
              <div className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-md">
                <div className="flex items-start">
                  <div>
                    <h3 className="font-medium text-amber-800">Limited Access Account</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Your account will have limited functionality until your business is fully verified with a license number or EIN.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Phone className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium">Phone Verification</h3>
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="welp-input"
                  disabled={isLoading || verificationSent}
                  required
                />
              </div>
              
              <Button
                onClick={handleSendVerification}
                className="welp-button w-full"
                disabled={isLoading || isResendDisabled || !phoneNumber}
              >
                {isLoading ? "Sending..." : isResendDisabled ? `Resend Code (${timer}s)` : "Send Verification Code"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessVerificationSuccess;
