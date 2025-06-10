
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { checkEmailExistsViaEdgeFunction, checkPhoneExistsViaEdgeFunction, checkDuplicatesViaEdgeFunction } from "@/services/duplicateAccount/edgeFunctionChecker";
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
        console.log("Checking email exists via edge function:", businessEmail);
        setIsCheckingDuplicates(true);
        try {
          const exists = await checkEmailExistsViaEdgeFunction(businessEmail);
          setEmailExists(exists);
          console.log("Email exists result:", exists);
        } catch (error) {
          console.error("Error checking email:", error);
        } finally {
          setIsCheckingDuplicates(false);
        }
      } else {
        setEmailExists(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [businessEmail]);

  // Check phone immediately when it changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (businessPhone && businessPhone.replace(/\D/g, '').length >= 10) {
        console.log("Checking phone exists via edge function:", businessPhone);
        setIsCheckingDuplicates(true);
        try {
          const exists = await checkPhoneExistsViaEdgeFunction(businessPhone);
          setPhoneExists(exists);
          console.log("Phone exists result:", exists);
        } catch (error) {
          console.error("Error checking phone:", error);
        } finally {
          setIsCheckingDuplicates(false);
        }
      } else {
        setPhoneExists(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [businessPhone]);

  // Comprehensive duplicate check when we have enough info
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (businessEmail && businessPhone && businessName) {
        console.log("Running comprehensive duplicate check via edge function");
        setIsCheckingDuplicates(true);
        
        try {
          const result = await checkDuplicatesViaEdgeFunction(
            businessEmail,
            businessPhone,
            businessName,
            businessAddress
          );
          
          console.log("Comprehensive duplicate check result:", result);
          
          if (result.isDuplicate) {
            setDuplicateResult(result);
            setShowDuplicateDialog(true);
          } else {
            setDuplicateResult(null);
            setShowDuplicateDialog(false);
          }
        } catch (error) {
          console.error("Error in comprehensive duplicate check:", error);
        } finally {
          setIsCheckingDuplicates(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [businessEmail, businessPhone, businessName, businessAddress]);

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
