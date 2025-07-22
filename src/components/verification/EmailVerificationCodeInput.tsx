
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
      <InputOTP
        value={value}
        onChange={onChange}
        maxLength={6}
        render={({ slots }) => (
          <div className="flex gap-2 justify-center">
            <InputOTPGroup>
              {slots.map((slot, idx) => (
                <InputOTPSlot key={idx} {...slot} index={idx} />
              ))}
            </InputOTPGroup>
          </div>
        )}
      />
      <p className="text-xs text-gray-500 mt-2">
        Enter the 6-digit code sent to your email
      </p>
    </div>
  );
};

export default EmailVerificationCodeInput;
