import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sendSmsVerification, formatPhoneNumber } from "@/utils/phoneVerification";

const VerifyPhone = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [storedCode, setStoredCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  useEffect(() => {
    // Get data from session storage
    const storedData = sessionStorage.getItem("customerSignupData");
    const storedVerificationCode = sessionStorage.getItem("phoneVerificationCode");
    
    if (!storedData) {
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
    
    // If there's already a stored code from a previous send, use it
    if (storedVerificationCode) {
      setStoredCode(storedVerificationCode);
    } else {
      // Otherwise send a new verification code
      sendVerificationCode(parsedData.phone);
    }
  }, [navigate, toast]);

  const sendVerificationCode = async (phone: string) => {
    setIsSending(true);
    
    try {
      const formattedPhone = formatPhoneNumber(phone);
      const result = await sendSmsVerification(formattedPhone);
      
      if (result.success) {
        // Save the verification code in session storage
        setStoredCode(result.verificationCode);
        sessionStorage.setItem("phoneVerificationCode", result.verificationCode);
        
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${phone}.`,
        });
      } else {
        toast({
          title: "Failed to Send Code",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = () => {
    setIsVerifying(true);
    
    // Check verification code
    setTimeout(() => {
      if (verificationCode === storedCode) {
        // Successful verification
        setShowSuccessDialog(true);
      } else {
        // Failed verification
        const newAttempts = remainingAttempts - 1;
        setRemainingAttempts(newAttempts);
        
        if (newAttempts > 0) {
          toast({
            title: "Invalid Code",
            description: `Incorrect verification code. ${newAttempts} attempts remaining.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: "You've exceeded the maximum number of attempts. Please start over.",
            variant: "destructive",
          });
          
          // Clear session storage and redirect back to signup
          sessionStorage.removeItem("customerSignupData");
          sessionStorage.removeItem("phoneVerificationCode");
          navigate("/signup", { replace: true });
        }
      }
      
      setIsVerifying(false);
    }, 1000);
  };

  const handleResendCode = () => {
    sendVerificationCode(phoneNumber);
  };

  const handleContinueToProfile = () => {
    // In a real app, you would create the user account here
    // For now, just simulate a successful account creation
    sessionStorage.setItem("currentUser", JSON.stringify({
      ...customerData,
      id: Math.random().toString(36).substring(2, 15),
      type: "customer"
    }));
    
    // Clear verification data
    sessionStorage.removeItem("customerSignupData");
    sessionStorage.removeItem("phoneVerificationCode");
    
    // Redirect to profile page
    navigate("/profile", { replace: true });
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
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Resend Code"}
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
