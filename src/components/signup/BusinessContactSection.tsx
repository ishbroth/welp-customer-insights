
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { DuplicateAccountDialog } from "./DuplicateAccountDialog";
import { checkForDuplicateAccount, DuplicateCheckResult } from "@/services/duplicateAccountService";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface BusinessContactSectionProps {
  businessEmail: string;
  setBusinessEmail: (value: string) => void;
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
  businessName?: string; // Add business name prop
}

export const BusinessContactSection = ({
  businessEmail,
  setBusinessEmail,
  businessPhone,
  setBusinessPhone,
  businessName
}: BusinessContactSectionProps) => {
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Debounced duplicate checking
  useEffect(() => {
    if (!businessEmail || !businessPhone) return;
    
    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        const result = await checkForDuplicateAccount(businessEmail, businessPhone, businessName);
        setDuplicateResult(result);
        if (result.isDuplicate) {
          setShowDuplicateDialog(true);
        }
      } catch (error) {
        console.error("Error checking for duplicates:", error);
      } finally {
        setIsChecking(false);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [businessEmail, businessPhone, businessName]);

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

      {isChecking && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Checking for existing accounts...
          </AlertDescription>
        </Alert>
      )}

      {duplicateResult && (
        <DuplicateAccountDialog
          isOpen={showDuplicateDialog}
          onClose={() => setShowDuplicateDialog(false)}
          duplicateResult={duplicateResult}
        />
      )}
    </>
  );
};
