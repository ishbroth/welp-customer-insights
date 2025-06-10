
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordSetupStepProps {
  businessPassword: string;
  setBusinessPassword: (value: string) => void;
  businessConfirmPassword: string;
  setBusinessConfirmPassword: (value: string) => void;
  isSubmitting: boolean;
  onCreateAccount: () => void;
  disabled?: boolean;
}

export const PasswordSetupStep = ({
  businessPassword,
  setBusinessPassword,
  businessConfirmPassword,
  setBusinessConfirmPassword,
  isSubmitting,
  onCreateAccount,
  disabled = false
}: PasswordSetupStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) {
      onCreateAccount();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Set Your Password</h2>
      
      <div>
        <label htmlFor="businessPassword" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input
          id="businessPassword"
          type="password"
          value={businessPassword}
          onChange={(e) => setBusinessPassword(e.target.value)}
          className="welp-input"
          required
          disabled={disabled}
        />
      </div>
      
      <div>
        <label htmlFor="businessConfirmPassword" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <Input
          id="businessConfirmPassword"
          type="password"
          value={businessConfirmPassword}
          onChange={(e) => setBusinessConfirmPassword(e.target.value)}
          className="welp-input"
          required
          disabled={disabled}
        />
      </div>
      
      <Button 
        type="submit" 
        className="welp-button w-full" 
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? "Creating Account..." : "Create Business Account"}
      </Button>
    </form>
  );
};
