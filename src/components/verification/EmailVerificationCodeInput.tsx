
import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface EmailVerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const EmailVerificationCodeInput: React.FC<EmailVerificationCodeInputProps> = ({ 
  value, 
  onChange,
  disabled = false
}) => {
  const handleClearCode = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Verification Code</div>
      <div className="flex gap-2 justify-center">
        <InputOTP
          value={value}
          onChange={onChange}
          maxLength={6}
          disabled={disabled}
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
      <div className="flex flex-col items-center space-y-1">
        <p className="text-xs text-gray-500">
          Enter the 6-digit code sent to your email (expires in 10 minutes)
        </p>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClearCode}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            clear code
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationCodeInput;
