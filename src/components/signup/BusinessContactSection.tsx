
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { checkForDuplicateAccount } from "@/services/duplicateAccountService";
import { checkEmailExists } from "@/services/duplicateAccount/emailChecker";
import { checkPhoneExists } from "@/services/duplicateAccount/phoneChecker";
import { DuplicateAccountDialog } from "./DuplicateAccountDialog";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);

  // Check email immediately when it changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (businessEmail && businessEmail.includes('@')) {
        console.log("Checking email exists:", businessEmail);
        setIsCheckingDuplicates(true);
        try {
          const exists = await checkEmailExists(businessEmail);
          setEmailExists(exists);
          console.log("Email exists result:", exists);
        } catch (error) {
          console.error("Error checking email:", error);
        } finally {
          setIsCheckingDuplicates(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [businessEmail]);

  // Check phone immediately when it changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (businessPhone && businessPhone.length >= 10) {
        console.log("Checking phone exists:", businessPhone);
        setIsCheckingDuplicates(true);
        try {
          const exists = await checkPhoneExists(businessPhone);
          setPhoneExists(exists);
          console.log("Phone exists result:", exists);
        } catch (error) {
          console.error("Error checking phone:", error);
        } finally {
          setIsCheckingDuplicates(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [businessPhone]);

  // Comprehensive duplicate check when we have enough info
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
        {emailExists && (
          <Alert className="mt-2 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              This email is already registered with an existing account.
            </AlertDescription>
          </Alert>
        )}
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
        {phoneExists && (
          <Alert className="mt-2 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              This phone number is already registered with an existing account.
            </AlertDescription>
          </Alert>
        )}
        {isCheckingDuplicates && (
          <p className="text-sm text-gray-500 mt-1">Checking for duplicates...</p>
        )}
      </div>

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
