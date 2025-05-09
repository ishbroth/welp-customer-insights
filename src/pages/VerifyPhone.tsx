
import { useSearchParams } from "react-router-dom";
import VerificationLayout from "@/components/verification/VerificationLayout";
import VerificationCodeInput from "@/components/verification/VerificationCodeInput";
import ResendCodeButton from "@/components/verification/ResendCodeButton";
import VerifyCodeButton from "@/components/verification/VerifyCodeButton";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";

const VerifyPhone = () => {
  const [searchParams] = useSearchParams();
  
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
