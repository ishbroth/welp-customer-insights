
import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface EmailVerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const EmailVerificationCodeInput: React.FC<EmailVerificationCodeInputProps> = ({ 
  value, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Verification Code</div>
      <div className="flex gap-2 justify-center">
        <InputOTP
          value={value}
          onChange={onChange}
          maxLength={6}
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
      <p className="text-xs text-gray-500 mt-2">
        Enter the 6-digit code sent to your email
      </p>
    </div>
  );
};

export default EmailVerificationCodeInput;
