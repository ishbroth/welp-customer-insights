
import { useState } from "react";

export const usePhoneVerificationState = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  return {
    verificationCode,
    setVerificationCode,
    isCodeValid,
    setIsCodeValid,
    isVerifying,
    setIsVerifying,
    isResending,
    setIsResending
  };
};
