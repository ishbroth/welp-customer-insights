import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Phone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useMutation } from "@tanstack/react-query";
import { resendVerificationCode, verifyPhoneNumber } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { createSearchableCustomer } from "@/services/customerService";

const VerifyPhone = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  
  // Extract parameters from URL
  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const name = searchParams.get("name");
  const phoneNumber = searchParams.get("phone");
  const accountType = searchParams.get("accountType");
  const businessName = searchParams.get("businessName");
  const address = searchParams.get("address");
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const zipCode = searchParams.get("zipCode");
  
  // Mutation for verifying phone number
  const { mutate: verifyCode, isPending: isVerifying } = useMutation({
    mutationFn: verifyPhoneNumber,
    onSuccess: async (data) => {
      if (data?.isValid) {
        setIsCodeValid(true);
        
        // Proceed with signup after successful verification
        if (email && password && name && phoneNumber && accountType) {
          try {
            // Sign up the user with the updated signup function interface
            await signup({
              email, 
              password, 
              name, 
              phoneNumber, 
              accountType, 
              businessName, 
              address, 
              city, 
              state, 
              zipCode
            });
            
            // Create a searchable customer profile (mock for now since we've disconnected from Supabase)
            await createSearchableCustomer({
              firstName: name?.split(' ')[0] || "",
              lastName: name?.split(' ').slice(1).join(' ') || "",
              phone: phoneNumber || "",
              address: address || "",
              city: city || "",
              state: state || "",
              zipCode: zipCode || ""
            });
            
            toast({
              title: "Verification successful",
              description: "Your phone number has been successfully verified.",
            });
            
            // Redirect based on account type
            if (accountType === "business") {
              navigate("/business-verification-success");
            } else {
              navigate("/");
            }
          } catch (error: any) {
            console.error("Signup failed:", error);
            toast({
              title: "Signup failed",
              description: error.message || "An error occurred during signup.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Missing information",
            description: "Some required information is missing. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        setIsCodeValid(false);
        toast({
          title: "Invalid code",
          description: "The verification code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Verification failed:", error);
      toast({
        title: "Verification failed",
        description: error.message || "An error occurred during verification.",
        variant: "destructive",
      });
      setIsCodeValid(false);
    },
  });
  
  // Mutation for resending verification code
  const { mutate: resendCode, isPending: isResending } = useMutation({
    mutationFn: resendVerificationCode,
    onSuccess: () => {
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your phone number.",
      });
      startResendTimer();
    },
    onError: (error: any) => {
      console.error("Resend code failed:", error);
      toast({
        title: "Resend failed",
        description: error.message || "Failed to resend the verification code.",
        variant: "destructive",
      });
    },
  });
  
  const handleVerifyCode = async () => {
    if (phoneNumber && verificationCode) {
      verifyCode({ phoneNumber, code: verificationCode });
    } else {
      toast({
        title: "Missing information",
        description: "Please enter both your phone number and the verification code.",
        variant: "destructive",
      });
    }
  };
  
  const handleResendCode = () => {
    if (phoneNumber) {
      resendCode({ phoneNumber });
      setIsResendDisabled(true);
    } else {
      toast({
        title: "Missing phone number",
        description: "Please provide your phone number to resend the verification code.",
        variant: "destructive",
      });
    }
  };
  
  // Start the resend timer
  const startResendTimer = () => {
    setIsResendDisabled(true);
    setResendTimer(60);
    const intervalId = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          clearInterval(intervalId);
          setIsResendDisabled(false);
          return 0;
        }
      });
    }, 1000);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-4">
        <CardContent className="flex flex-col space-y-4">
          <div className="text-center">
            <Phone className="mx-auto h-10 w-10 text-blue-500" />
            <h2 className="text-2xl font-semibold">Verify Your Phone</h2>
            <p className="text-gray-600">
              Enter the 6-digit code we sent to {phoneNumber}
            </p>
          </div>
          
          <Input
            type="number"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="welp-input"
          />
          
          {!isCodeValid && (
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Invalid verification code
            </div>
          )}
          
          <Button 
            className="welp-button w-full" 
            onClick={handleVerifyCode}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 4V2m0 18v-2m5.66-1.34L18.34 17l1.32-1.32M5.06 6.46 6.46 5.06 7.78 6.38M19.92 12h-2m-14 0H4m5.66 1.34L5.06 17l-1.32-1.32M18.94 6.46l-1.4 1.4L16.22 6.38M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/>
                </svg>
                Verifying Code...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Code
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Didn't receive the code?
            <Button 
              variant="link" 
              onClick={handleResendCode}
              disabled={isResendDisabled || isResending}
            >
              {isResending ? "Resending..." : `Resend code ${isResendDisabled ? `(${resendTimer}s)` : ""}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPhone;
