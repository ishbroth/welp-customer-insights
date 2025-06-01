
import { useVerificationTimer } from "@/hooks/useVerificationTimer";
import { usePhoneVerificationState } from "@/hooks/usePhoneVerificationState";
import { usePhoneVerificationActions } from "@/hooks/usePhoneVerificationActions";

interface PhoneVerificationProps {
  email: string | null;
  password: string | null;
  name: string | null;
  phoneNumber: string | null;
  accountType: string | null;
  businessName?: string | null;
  address?: string | null;
  city?: string | null; 
  state?: string | null;
  zipCode?: string | null;
}

export const usePhoneVerification = ({
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
}: PhoneVerificationProps) => {
  const {
    verificationCode,
    setVerificationCode,
    isCodeValid,
    setIsCodeValid,
    isVerifying,
    setIsVerifying,
    isResending,
    setIsResending
  } = usePhoneVerificationState();
  
  const { 
    isDisabled: isResendDisabled, 
    timer, 
    startTimer 
  } = useVerificationTimer();

  const { handleVerifyCode: baseHandleVerifyCode, handleResendCode } = usePhoneVerificationActions({
    email,
    password,
    name,
    phoneNumber,
    accountType,
    businessName,
    address,
    city,
    state,
    zipCode,
    setIsCodeValid,
    setIsVerifying,
    setIsResending,
    startTimer
  });

  const handleVerifyCode = async () => {
    await baseHandleVerifyCode(verificationCode);
  };
  
  return {
    verificationCode,
    setVerificationCode,
    isCodeValid,
    isVerifying,
    isResending,
    isResendDisabled,
    resendTimer: timer,
    handleVerifyCode,
    handleResendCode
  };
};
