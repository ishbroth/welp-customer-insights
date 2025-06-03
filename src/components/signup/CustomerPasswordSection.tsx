
import { Input } from "@/components/ui/input";

interface CustomerPasswordSectionProps {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
}

export const CustomerPasswordSection = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword
}: CustomerPasswordSectionProps) => {
  return (
    <>
      <div>
        <label htmlFor="customerPassword" className="block text-sm font-medium mb-1">Password</label>
        <Input
          id="customerPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="customerConfirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
        <Input
          id="customerConfirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      {password !== confirmPassword && confirmPassword && (
        <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
      )}
    </>
  );
};
