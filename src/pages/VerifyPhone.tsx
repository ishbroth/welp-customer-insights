
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import VerificationLayout from "@/components/verification/VerificationLayout";
import VerificationCodeInput from "@/components/verification/VerificationCodeInput";
import ResendCodeButton from "@/components/verification/ResendCodeButton";
import VerifyCodeButton from "@/components/verification/VerifyCodeButton";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { supabase } from "@/integrations/supabase/client";

const VerifyPhone = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Extract parameters from URL
  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const name = searchParams.get("name");
  const rawPhoneNumber = searchParams.get("phone");
  const accountType = searchParams.get("accountType");
  const businessName = searchParams.get("businessName");
  const address = searchParams.get("address");
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const zipCode = searchParams.get("zipCode");
  
  // Format the phone number properly for display and processing
  const phoneNumber = rawPhoneNumber ? formatPhoneNumber(rawPhoneNumber) : null;
  
  console.log("🔍 VerifyPhone component loaded with params:", {
    email,
    phone: rawPhoneNumber,
    formattedPhone: phoneNumber,
    accountType,
    businessName
  });
  
  const {
    verificationCode,
    setVerificationCode,
    isCodeValid,
    isVerifying,
    isResending,
    isResendDisabled,
    resendTimer,
    handleVerifyCode,
    handleResendCode
  } = usePhoneVerification({
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
  
  // Automatically send SMS when component mounts
  useEffect(() => {
    const sendInitialSMS = async () => {
      if (!phoneNumber) {
        console.error("❌ No phone number provided for verification");
        toast({
          title: "Error",
          description: "No phone number provided for verification",
          variant: "destructive"
        });
        return;
      }
      
      console.log("📤 Sending initial SMS to:", phoneNumber);
      
      try {
        const { data, error } = await supabase.functions.invoke("verify-phone", {
          body: {
            phoneNumber: phoneNumber,
            actionType: "send"
          }
        });
        
        console.log("📊 Initial SMS send result:", { data, error });
        
        if (error) {
          console.error("❌ Error sending initial SMS:", error);
          toast({
            title: "SMS Send Failed",
            description: error.message || "Failed to send verification code. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        if (data?.success) {
          console.log("✅ Initial SMS sent successfully");
          toast({
            title: "Verification Code Sent",
            description: `A verification code has been sent to ${phoneNumber}`,
          });
        } else {
          console.error("❌ SMS send failed:", data?.message);
          toast({
            title: "SMS Send Failed",
            description: data?.message || "Failed to send verification code. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("💥 Unexpected error sending initial SMS:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while sending the verification code.",
          variant: "destructive"
        });
      }
    };
    
    // Send SMS after a short delay to ensure component is fully mounted
    const timer = setTimeout(sendInitialSMS, 1000);
    return () => clearTimeout(timer);
  }, [phoneNumber, toast]);
  
  return (
    <VerificationLayout
      title="Verify Your Phone"
      subtitle={`Enter the 6-digit code we sent to ${phoneNumber}`}
    >
      <VerificationCodeInput
        value={verificationCode}
        onChange={setVerificationCode}
        isValid={isCodeValid}
      />
      
      <VerifyCodeButton
        onClick={handleVerifyCode}
        isLoading={isVerifying}
      />
      
      <ResendCodeButton
        onResend={handleResendCode}
        isDisabled={isResendDisabled}
        isResending={isResending}
        timer={resendTimer}
      />
    </VerificationLayout>
  );
};

export default VerifyPhone;
