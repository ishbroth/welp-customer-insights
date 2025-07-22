
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailVerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
}

const EmailVerificationCodeInput = ({
  value,
  onChange,
  isValid = true
}: EmailVerificationCodeInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (inputValue.length <= 6) {
      onChange(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="email-verification-code">
        Enter the 6-digit code sent to your email
      </Label>
      <Input
        id="email-verification-code"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="000000"
        value={value}
        onChange={handleChange}
        className={`text-center text-xl tracking-wider font-mono ${
          !isValid ? 'border-red-500' : ''
        }`}
        maxLength={6}
        autoComplete="one-time-code"
      />
      {!isValid && (
        <p className="text-sm text-red-600">
          Please enter a valid 6-digit verification code
        </p>
      )}
    </div>
  );
};

export default EmailVerificationCodeInput;
