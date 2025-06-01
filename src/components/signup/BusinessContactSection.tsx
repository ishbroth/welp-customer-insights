
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";

interface BusinessContactSectionProps {
  businessEmail: string;
  setBusinessEmail: (value: string) => void;
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
}

export const BusinessContactSection = ({
  businessEmail,
  setBusinessEmail,
  businessPhone,
  setBusinessPhone
}: BusinessContactSectionProps) => {
  return (
    <>
      <div>
        <label htmlFor="businessEmail" className="block text-sm font-medium mb-1">Business Email</label>
        <Input
          id="businessEmail"
          type="email"
          placeholder="business@example.com"
          value={businessEmail}
          onChange={(e) => setBusinessEmail(e.target.value)}
          className="welp-input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
      </div>
      
      <div>
        <label htmlFor="businessPhone" className="block text-sm font-medium mb-1">Business Phone</label>
        <PhoneInput
          id="businessPhone"
          placeholder="(555) 123-4567"
          value={businessPhone}
          onChange={(e) => setBusinessPhone(e.target.value)}
          className="welp-input"
          required
        />
      </div>
    </>
  );
};
