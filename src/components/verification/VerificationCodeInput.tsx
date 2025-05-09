
import { Input } from "@/components/ui/input";
import { AlertTriangle } from 'lucide-react';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

const VerificationCodeInput = ({ 
  value, 
  onChange, 
  isValid 
}: VerificationCodeInputProps) => {
  return (
    <>
      <Input
        type="number"
        placeholder="Verification Code"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="welp-input"
      />
      
      {!isValid && (
        <div className="flex items-center text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Invalid verification code
        </div>
      )}
    </>
  );
};

export default VerificationCodeInput;
