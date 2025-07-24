
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { DuplicateAccountDialog } from "./DuplicateAccountDialog";
import { useDuplicateChecker } from "@/hooks/useDuplicateChecker";
import { 
  EmailValidationAlert, 
  PhoneValidationAlert, 
  DuplicateBusinessAlert, 
  CheckingDuplicatesIndicator 
} from "./ValidationAlerts";

interface BusinessContactSectionProps {
  businessEmail: string;
  setBusinessEmail: (value: string) => void;
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
  businessName: string;
  businessAddress?: string;
  onDuplicateFound?: (hasDuplicate: boolean) => void;
}

export const BusinessContactSection = ({
  businessEmail,
  setBusinessEmail,
  businessPhone,
  setBusinessPhone,
  businessName,
  businessAddress = "",
  onDuplicateFound
}: BusinessContactSectionProps) => {
  const {
    duplicateResult,
    showDuplicateDialog,
    isCheckingDuplicates,
    emailExists,
    phoneExists,
    handleDialogClose
  } = useDuplicateChecker({
    businessEmail,
    businessPhone,
    businessName,
    businessAddress,
    onDuplicateFound
  });

  return (
    <>
      <div>
        <label htmlFor="businessEmail" className="block text-sm font-medium mb-1">
          Business Email <span className="text-red-500">*</span>
        </label>
        <Input
          id="businessEmail"
          type="email"
          placeholder="contact@business.com"
          value={businessEmail}
          onChange={(e) => setBusinessEmail(e.target.value)}
          className="welp-input"
          required
        />
        <p className="text-sm text-gray-500 mt-1">This will be used to sign in to your account and for email verification</p>
        <EmailValidationAlert emailExists={emailExists} />
      </div>
      
      <div>
        <label htmlFor="businessPhone" className="block text-sm font-medium mb-1">
          Business Phone <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          id="businessPhone"
          value={businessPhone}
          onChange={(value) => setBusinessPhone(value || "")}
          className="welp-input"
          required
        />
        <p className="text-sm text-gray-500 mt-1">This will be used for business communication purposes</p>
        <PhoneValidationAlert phoneExists={phoneExists} />
        <DuplicateBusinessAlert duplicateResult={duplicateResult} />
        <CheckingDuplicatesIndicator isCheckingDuplicates={isCheckingDuplicates} />
      </div>

      {duplicateResult && (
        <DuplicateAccountDialog
          isOpen={showDuplicateDialog}
          onClose={handleDialogClose}
          duplicateResult={duplicateResult}
        />
      )}
    </>
  );
};
