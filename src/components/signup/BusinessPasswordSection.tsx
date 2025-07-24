
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface BusinessPasswordSectionProps {
  businessPassword: string;
  setBusinessPassword: (value: string) => void;
  businessConfirmPassword: string;
  setBusinessConfirmPassword: (value: string) => void;
}

export const BusinessPasswordSection = ({
  businessPassword,
  setBusinessPassword,
  businessConfirmPassword,
  setBusinessConfirmPassword
}: BusinessPasswordSectionProps) => {
  return (
    <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center mb-4">
        <Lock className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Create Your Password</h3>
      </div>
      
      <div>
        <label htmlFor="businessPassword" className="block text-sm font-medium mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <Input
          id="businessPassword"
          type="password"
          placeholder="Create a strong password"
          value={businessPassword}
          onChange={(e) => setBusinessPassword(e.target.value)}
          className="welp-input"
          autoComplete="new-password"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters</p>
      </div>
      
      <div>
        <label htmlFor="businessConfirmPassword" className="block text-sm font-medium mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <Input
          id="businessConfirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={businessConfirmPassword}
          onChange={(e) => setBusinessConfirmPassword(e.target.value)}
          className="welp-input"
          autoComplete="new-password"
          required
        />
        {businessConfirmPassword && businessPassword !== businessConfirmPassword && (
          <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>
    </div>
  );
};
