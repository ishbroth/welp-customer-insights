
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { checkForDuplicateAccount } from "@/services/duplicateAccountService";
import { DuplicateAccountDialog } from "./DuplicateAccountDialog";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";

interface BusinessContactSectionProps {
  businessEmail: string;
  setBusinessEmail: (value: string) => void;
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
  businessName: string;
  businessAddress?: string;
}

export const BusinessContactSection = ({
  businessEmail,
  setBusinessEmail,
  businessPhone,
  setBusinessPhone,
  businessName,
  businessAddress
}: BusinessContactSectionProps) => {
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // Debounced duplicate check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (businessEmail && businessPhone && businessName) {
        checkDuplicates();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [businessEmail, businessPhone, businessName, businessAddress]);

  const checkDuplicates = async () => {
    if (!businessEmail || !businessPhone || !businessName) return;
    
    setIsCheckingDuplicates(true);
    
    try {
      console.log("Checking for duplicates with:", {
        email: businessEmail,
        phone: businessPhone,
        businessName,
        address: businessAddress
      });
      
      const result = await checkForDuplicateAccount(
        businessEmail,
        businessPhone,
        businessName,
        businessAddress
      );
      
      console.log("Duplicate check result:", result);
      
      if (result.isDuplicate) {
        setDuplicateResult(result);
        setShowDuplicateDialog(true);
      } else {
        setDuplicateResult(null);
        setShowDuplicateDialog(false);
      }
    } catch (error) {
      console.error("Error checking for duplicates:", error);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  return (
    <>
      <div>
        <label htmlFor="businessEmail" className="block text-sm font-medium mb-1">Business Email</label>
        <Input
          id="businessEmail"
          type="email"
          placeholder="contact@business.com"
          value={businessEmail}
          onChange={(e) => setBusinessEmail(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="businessPhone" className="block text-sm font-medium mb-1">Business Phone</label>
        <PhoneInput
          id="businessPhone"
          value={businessPhone}
          onChange={(value) => setBusinessPhone(value || "")}
          className="welp-input"
          required
        />
        {isCheckingDuplicates && (
          <p className="text-sm text-gray-500 mt-1">Checking for duplicates...</p>
        )}
      </div>

      {duplicateResult && (
        <DuplicateAccountDialog
          isOpen={showDuplicateDialog}
          onClose={() => setShowDuplicateDialog(false)}
          duplicateResult={duplicateResult}
          currentEmail={businessEmail}
          currentPhone={businessPhone}
          currentName={businessName}
          currentAddress={businessAddress}
        />
      )}
    </>
  );
};
