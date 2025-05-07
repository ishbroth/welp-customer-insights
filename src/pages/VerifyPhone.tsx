
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sendSmsVerification } from "@/utils/phoneVerification";

const VerifyPhone = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, useMockData } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Load customer data from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem("customerSignupData");
    if (storedData) {
      setCustomerData(JSON.parse(storedData));
    } else {
      // Redirect to signup if no data is found
      navigate("/signup?type=customer");
    }
  }, [navigate]);

  // Countdown timer for resending code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!verificationCode || !customerData) {
      toast({
        title: "Missing Information",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    if (useMockData) {
      // For demo purposes, any 6-digit code is valid
      if (verificationCode.length === 6) {
        // Mock successful verification
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Verification Successful",
          description: "Your phone number has been verified.",
        });
        
        // Navigate to success/login page
        navigate("/");
      } else {
        toast({
          title: "Invalid Code",
          description: "Please enter a valid 6-digit verification code.",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    } else {
      // In a real implementation, we would verify the code with an API call
      // For now, we'll just simulate validation and create the account
      try {
        // For demo, we'll allow any 6-digit code to work
        if (verificationCode.length === 6) {
          // Create the account with Supabase
          const { success, error } = await signUp(
            customerData.email,
            customerData.password,
            {
              first_name: customerData.firstName,
              last_name: customerData.lastName,
              phone: customerData.phone,
              zipcode: customerData.zipCode,
              type: "customer"
            }
          );
          
          if (success) {
            toast({
              title: "Account Created",
              description: "Your account has been created successfully!",
            });
            
            // Clear the session storage
            sessionStorage.removeItem("customerSignupData");
            
            // Navigate to home page
            navigate("/");
          } else {
            toast({
              title: "Signup Error",
              description: error || "Failed to create account. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Invalid Code",
            description: "Please enter a valid 6-digit verification code.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast({
          title: "Verification Error",
          description: "An error occurred during verification. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResendCode = async () => {
    if (!customerData?.phone) {
      toast({
        title: "Error",
        description: "Phone number not found. Please go back to signup.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);

    try {
      if (useMockData) {
        // Mock resending code
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your phone.",
        });
        
        // Set a countdown to prevent spam
        setCountdown(30);
      } else {
        // Call the real SMS verification service
        const response = await sendSmsVerification(customerData.phone);
        
        if (response.success) {
          toast({
            title: "Code Resent",
            description: "A new verification code has been sent to your phone.",
          });
          
          // Set a countdown to prevent spam
          setCountdown(30);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to send verification code. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error resending code:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Verify Your Phone</h1>
            
            {customerData && (
              <div className="space-y-6">
                <div>
                  <p className="text-center mb-4">
                    We've sent a verification code to:
                    <span className="block font-semibold mt-2">{customerData.phone}</span>
                  </p>
                </div>
                
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
                    Enter Verification Code
                  </label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleVerify}
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify & Create Account"}
                </Button>
                
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    onClick={handleResendCode}
                    disabled={isResending || countdown > 0}
                    className="text-sm"
                  >
                    {countdown > 0 
                      ? `Resend code in ${countdown}s` 
                      : isResending 
                        ? "Sending..." 
                        : "Didn't receive a code? Resend"}
                  </Button>
                </div>
                
                <div className="text-center mt-2">
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/signup?type=customer")}
                    className="text-sm"
                  >
                    Use a different phone number
                  </Button>
                </div>

                {useMockData && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                    <p><strong>Demo Mode:</strong> Enter any 6-digit code to continue.</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyPhone;
