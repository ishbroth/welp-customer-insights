
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import EmailVerificationCodeInput from "@/components/verification/EmailVerificationCodeInput";
import VerifyEmailCodeButton from "@/components/verification/VerifyEmailCodeButton";
import ResendEmailCodeButton from "@/components/verification/ResendEmailCodeButton";
import { supabase } from "@/integrations/supabase/client";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(60);

  // Get parameters from URL
  const email = searchParams.get("email");
  const accountType = searchParams.get("type");
  
  // Get user data from localStorage if available
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email provided for verification",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    // Try to get user data from localStorage
    const storedUserData = localStorage.getItem("pendingVerification");
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }
  }, [email, navigate, toast]);

  // Resend timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isResendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isResendDisabled, resendTimer]);

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: {
          email,
          code: verificationCode,
          accountType,
          userData
        }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.isValid) {
        // Clear stored user data
        localStorage.removeItem("pendingVerification");
        
        toast({
          title: "Email Verified!",
          description: "Your account has been created successfully.",
        });

        // Redirect based on account type
        if (accountType === 'business') {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid or expired verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying email code:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify email code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setIsResending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-email-verification-code', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email.",
        });
        setIsResendDisabled(true);
        setResendTimer(60);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-welp-red mb-2">Welp.</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We've sent a verification code to:
          </p>
          <p className="font-semibold text-gray-800">{email}</p>
        </div>

        <div className="space-y-6">
          <EmailVerificationCodeInput
            value={verificationCode}
            onChange={setVerificationCode}
            isValid={verificationCode.length === 0 || verificationCode.length === 6}
          />

          <VerifyEmailCodeButton
            onClick={handleVerifyCode}
            isLoading={isVerifying}
            disabled={verificationCode.length !== 6}
          />

          <ResendEmailCodeButton
            onResend={handleResendCode}
            isDisabled={isResendDisabled}
            isResending={isResending}
            timer={resendTimer}
          />

          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
