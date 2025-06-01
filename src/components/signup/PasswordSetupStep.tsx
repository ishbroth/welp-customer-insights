
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordSetupStepProps {
  businessPassword: string;
  setBusinessPassword: (value: string) => void;
  businessConfirmPassword: string;
  setBusinessConfirmPassword: (value: string) => void;
  isSubmitting: boolean;
  onCreateAccount: () => void;
}

export const PasswordSetupStep = ({
  businessPassword,
  setBusinessPassword,
  businessConfirmPassword,
  setBusinessConfirmPassword,
  isSubmitting,
  onCreateAccount
}: PasswordSetupStepProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Complete Your Account</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="businessPassword" className="block text-sm font-medium mb-1">Password</label>
          <Input
            id="businessPassword"
            type="password"
            value={businessPassword}
            onChange={(e) => setBusinessPassword(e.target.value)}
            className="welp-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="businessConfirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
          <Input
            id="businessConfirmPassword"
            type="password"
            value={businessConfirmPassword}
            onChange={(e) => setBusinessConfirmPassword(e.target.value)}
            className="welp-input"
            required
          />
          {businessPassword !== businessConfirmPassword && businessConfirmPassword && (
            <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>
        
        <div className="pt-4">
          <Button
            onClick={onCreateAccount}
            className="welp-button w-full"
            disabled={!businessPassword || businessPassword !== businessConfirmPassword || isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Business Account"}
          </Button>
        </div>
      </div>
    </div>
  );
};
