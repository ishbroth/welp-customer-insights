
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
    console.log("=== PASSWORD SETUP SUBMIT DEBUG ===");
    console.log("Form submission triggered");
    console.log("Disabled:", disabled);
    console.log("Is Submitting:", isSubmitting);
    console.log("Password length:", businessPassword.length);
    console.log("Passwords match:", businessPassword === businessConfirmPassword);
    
    if (!disabled) {
      console.log("Calling onCreateAccount...");
      onCreateAccount();
    } else {
      console.log("Form submission blocked - component is disabled");
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
          onChange={(e) => {
            console.log("Password field changed, new length:", e.target.value.length);
            setBusinessPassword(e.target.value);
          }}
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
          onChange={(e) => {
            console.log("Confirm password field changed, passwords match:", e.target.value === businessPassword);
            setBusinessConfirmPassword(e.target.value);
          }}
          className="welp-input"
          required
          disabled={disabled}
        />
      </div>
      
      <Button 
        type="submit" 
        className="welp-button w-full" 
        disabled={isSubmitting || disabled}
        onClick={() => {
          console.log("Button clicked - disabled:", isSubmitting || disabled);
        }}
      >
        {isSubmitting ? "Creating Account..." : "Create Business Account"}
      </Button>
    </form>
  );
};
