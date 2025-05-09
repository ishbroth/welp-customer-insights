
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const VerifyPhone = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [storedCode, setStoredCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  useEffect(() => {
    // Get data from session storage
    const storedData = sessionStorage.getItem("customerSignupData");
    const storedVerificationCode = sessionStorage.getItem("phoneVerificationCode");
    
    if (!storedData || !storedVerificationCode) {
      // No data found, redirect back to signup
      toast({
        title: "Session Expired",
        description: "Please start the signup process again.",
        variant: "destructive",
      });
      navigate("/signup", { replace: true });
      return;
    }
    
    const parsedData = JSON.parse(storedData);
    setCustomerData(parsedData);
    setPhoneNumber(parsedData.phone);
    setStoredCode(storedVerificationCode);
  }, [navigate, toast]);

  const handleVerifyCode = () => {
    setIsVerifying(true);
    
    // For demo purposes, simulate verification immediately regardless of input code
    setTimeout(() => {
      // Always treat as successful verification
      setShowSuccessDialog(true);
      setIsVerifying(false);
    }, 1000);
  };

  const handleResendCode = () => {
    // Generate a new random 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setStoredCode(newCode);
    sessionStorage.setItem("phoneVerificationCode", newCode);
    
    toast({
      title: "Code Resent",
      description: `A new verification code has been sent to ${phoneNumber}. For demo purposes, the code is: ${newCode}`,
    });
  };

  const handleContinueToProfile = async () => {
    if (!customerData) {
      toast({
        title: "Error",
        description: "Customer data is missing. Please try signing up again.",
        variant: "destructive",
      });
      navigate("/signup", { replace: true });
      return;
    }

    try {
      // Create the user account with Supabase with auto-confirmation
      const { data, error } = await supabase.auth.signUp({
        email: customerData.email,
        password: customerData.password,
        options: {
          data: {
            name: `${customerData.firstName} ${customerData.lastName}`,
            phone: customerData.phone,
            address: customerData.address,
            city: customerData.city,
            state: customerData.state,
            zip_code: customerData.zipCode,
            type: "customer"
          }
          // No emailRedirectTo option to make the account auto-confirmed
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Add customer to searchable database
      await addCustomerToSearchDatabase(customerData);
      
      // Clean up session storage
      sessionStorage.removeItem("customerSignupData");
      sessionStorage.removeItem("phoneVerificationCode");
      
      // Try to log in the user
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: customerData.email,
        password: customerData.password
      });
      
      if (loginError) {
        toast({
          title: "Account Created",
          description: "Your account has been created! Please log in with your email and password.",
        });
        navigate("/login", { 
          replace: true,
          state: { 
            message: "Your account has been created! Please log in with your email and password." 
          }
        });
      } else {
        // Login successful
        toast({
          title: "Welcome!",
          description: `Your account has been created and you're now logged in.`,
        });
        navigate("/profile", { replace: true });
      }
    } catch (error: any) {
      console.error("Account creation error:", error);
      toast({
        title: "Account Creation Failed",
        description: error.message || "An error occurred while creating your account.",
        variant: "destructive",
      });
      navigate("/signup", { replace: true });
    }
  };
  
  // Function to add customer to the searchable database
  const addCustomerToSearchDatabase = async (customer: any) => {
    try {
      // Insert data into searchable_customers table using type assertion
      // This is a workaround until the types are updated
      const { error } = await (supabase as any)
        .from('searchable_customers')
        .insert({
          first_name: customer.firstName,
          last_name: customer.lastName,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zip_code: customer.zipCode,
          email: customer.email,
        });
      
      if (error) {
        console.error("Error adding customer to search database:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in addCustomerToSearchDatabase:", error);
      // We don't want to stop the registration process if this fails
      // But we log the error for debugging purposes
    }
  };

  if (!phoneNumber) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Verify Your Phone Number</h1>
            
            <div className="space-y-4">
              <p className="text-center">
                We've sent a verification code to <span className="font-medium">{phoneNumber}</span>
              </p>
              
              <p className="text-center text-sm text-gray-500">
                For demo purposes, the code is: <span className="font-semibold">{storedCode}</span>
              </p>
              
              <div className="my-8">
                <label htmlFor="code" className="block text-sm font-medium text-center mb-3">
                  Enter the 6-digit verification code
                </label>
                <div className="flex justify-center mb-4">
                  <InputOTP 
                    maxLength={6} 
                    value={verificationCode} 
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleVerifyCode}
                  className="welp-button w-full"
                  disabled={verificationCode.length !== 6 || isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify Code"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  className="w-full"
                >
                  Resend Code
                </Button>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Having issues? <a href="mailto:support@welp.com" className="text-welp-primary hover:underline">Contact Support</a>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Congratulations!</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Your Account Has Been Created!</h3>
            <p className="text-gray-600 mb-6">
              Welcome to Welp, {customerData?.firstName}! Your account has been successfully verified.
            </p>
            <Button 
              onClick={handleContinueToProfile} 
              className="welp-button w-full"
            >
              Continue to Your Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default VerifyPhone;
