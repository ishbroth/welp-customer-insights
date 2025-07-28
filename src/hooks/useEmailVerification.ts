
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerificationCode, verifyEmailCode } from "@/utils/emailUtils";

interface UseEmailVerificationProps {
  email: string;
  password: string;
  name: string;
  accountType: 'customer' | 'business';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessName?: string;
  licenseNumber?: string;
  licenseType?: string;
}

export const useEmailVerification = ({
  email,
  password,
  name,
  accountType,
  address,
  city,
  state,
  zipCode,
  firstName,
  lastName,
  phone,
  businessName,
  licenseNumber,
  licenseType
}: UseEmailVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(60);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate verification code
  useEffect(() => {
    setIsCodeValid(verificationCode.length === 6 && /^\d{6}$/.test(verificationCode));
    if (verificationError) {
      setVerificationError(null);
    }
  }, [verificationCode, verificationError]);

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
    if (!isCodeValid) {
      setVerificationError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      console.log("🔍 Verifying email code and creating account...");
      
      // Prepare user data for account creation
      const userData = {
        password,
        name,
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode,
        businessName,
        licenseNumber,
        licenseType
      };

      const result = await verifyEmailCode(email, verificationCode, accountType, userData);

      if (result.success && result.isValid) {
        console.log("✅ Account created successfully");
        
        toast({
          title: "Account Created!",
          description: "Your email has been verified and account created successfully.",
        });

        // For business accounts, store the verification success flag BEFORE navigation
        if (accountType === 'business') {
          console.log("📊 Processing business verification success data...");
          
          // Get the stored pending verification data to preserve license verification results
          const pendingData = localStorage.getItem("pendingVerification");
          let licenseVerificationResult = null;
          
          if (pendingData) {
            try {
              const businessData = JSON.parse(pendingData);
              licenseVerificationResult = businessData.licenseVerificationResult;
              console.log("📋 Found license verification result:", licenseVerificationResult);
            } catch (error) {
              console.error("❌ Error parsing pending verification data:", error);
            }
          }
          
          // Store the verification success flag with license verification data
          const successData = {
            businessName: businessName || name,
            licenseVerificationResult: licenseVerificationResult || {
              verified: false,
              message: "Verification not completed during signup",
              isRealVerification: false
            },
            timestamp: Date.now()
          };
          
          console.log("💾 Storing business verification success data:", successData);
          localStorage.setItem("businessVerificationSuccess", JSON.stringify(successData));
          
          // Add a small delay to ensure localStorage is written before navigation
          setTimeout(() => {
            console.log("🚀 Navigating to profile page...");
            navigate("/profile", { replace: true });
          }, 100);
        } else {
          // For customer accounts, go to profile as before
          navigate("/profile", { replace: true });
        }
        
      } else {
        console.error("❌ Verification failed:", result.message);
        setVerificationError(result.message || "Invalid or expired verification code");
        
        // If code is already used or expired, enable resend immediately
        if (result.message?.includes("already been used") || result.message?.includes("expired")) {
          setIsResendDisabled(false);
          setResendTimer(60);
        }
      }
    } catch (error) {
      console.error("❌ Error verifying email code:", error);
      setVerificationError("Failed to verify email code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setVerificationError(null);

    try {
      const result = await sendEmailVerificationCode({ email });

      if (result.success) {
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email.",
        });
        setIsResendDisabled(true);
        setResendTimer(60);
        setVerificationCode(""); // Clear the current code
      } else {
        setVerificationError(result.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      setVerificationError("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return {
    verificationCode,
    setVerificationCode,
    isCodeValid,
    isVerifying,
    isResending,
    isResendDisabled,
    resendTimer,
    verificationError,
    handleVerifyCode,
    handleResendCode
  };
};
