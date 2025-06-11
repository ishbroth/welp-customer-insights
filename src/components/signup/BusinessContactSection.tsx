
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { checkEmailExistsViaEdgeFunction, checkPhoneExistsViaEdgeFunction, checkDuplicatesViaEdgeFunction } from "@/services/duplicateAccount/edgeFunctionChecker";
import { DuplicateAccountDialog } from "./DuplicateAccountDialog";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";

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
  businessAddress,
  onDuplicateFound
}: BusinessContactSectionProps) => {
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [hasDuplicates, setHasDuplicates] = useState(false);

  // Notify parent component when duplicates are found
  useEffect(() => {
    const duplicateFound = emailExists || phoneExists || (duplicateResult?.isDuplicate && !duplicateResult?.allowContinue);
    setHasDuplicates(duplicateFound);
    onDuplicateFound?.(duplicateFound);
  }, [emailExists, phoneExists, duplicateResult, onDuplicateFound]);

  // Check email immediately when it changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (businessEmail && businessEmail.includes('@')) {
        console.log("Checking email exists via edge function:", businessEmail);
        setIsCheckingDuplicates(true);
        try {
          const exists = await checkEmailExistsViaEdgeFunction(businessEmail, 'business');
          setEmailExists(exists);
          console.log("Email exists result:", exists);
          
          if (exists) {
            const result: DuplicateCheckResult = {
              isDuplicate: true,
              duplicateType: 'email',
              existingEmail: businessEmail,
              allowContinue: false
            };
            setDuplicateResult(result);
            setShowDuplicateDialog(true);
          }
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
          const exists = await checkPhoneExistsViaEdgeFunction(businessPhone, 'business');
          setPhoneExists(exists);
          console.log("Phone exists result:", exists);
          
          if (exists) {
            const result: DuplicateCheckResult = {
              isDuplicate: true,
              duplicateType: 'phone',
              existingPhone: businessPhone,
              allowContinue: false
            };
            setDuplicateResult(result);
            setShowDuplicateDialog(true);
          }
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
      if (businessEmail && businessPhone && businessName && businessAddress) {
        console.log("Running comprehensive duplicate check via edge function");
        setIsCheckingDuplicates(true);
        
        try {
          const result = await checkDuplicatesViaEdgeFunction(
            businessEmail,
            businessPhone,
            businessName,
            businessAddress,
            'business'
          );
          
          console.log("Comprehensive duplicate check result:", result);
          
          if (result.isDuplicate) {
            setDuplicateResult(result);
            if (!result.allowContinue) {
              setShowDuplicateDialog(true);
            }
          } else {
            // Only clear if no individual field duplicates exist
            if (!emailExists && !phoneExists) {
              setDuplicateResult(null);
              setShowDuplicateDialog(false);
            }
          }
        } catch (error) {
          console.error("Error in comprehensive duplicate check:", error);
        } finally {
          setIsCheckingDuplicates(false);
        }
      }
    }, 1000); // Longer delay for comprehensive check

    return () => clearTimeout(timeoutId);
  }, [businessEmail, businessPhone, businessName, businessAddress, emailExists, phoneExists]);

  const handleDialogClose = () => {
    setShowDuplicateDialog(false);
    // Keep the duplicate result so registration is still blocked
  };

  const getDuplicateMessage = () => {
    if (!duplicateResult) return null;

    switch (duplicateResult.duplicateType) {
      case 'email':
        return "This email is already registered with an existing business account.";
      case 'phone':
        return "This phone number is already registered with an existing business account.";
      case 'business_combination':
        return "A business with similar details already exists in our system.";
      case 'address':
        return "This address is already registered with another business.";
      case 'business_name':
        return "A business with a similar name already exists.";
      default:
        return "This information matches an existing business account.";
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
          <Alert className="mt-2 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This email is already registered with an existing business account.
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
          <Alert className="mt-2 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This phone number is already registered with an existing business account.
            </AlertDescription>
          </Alert>
        )}
        {duplicateResult && duplicateResult.duplicateType === 'business_combination' && (
          <Alert className="mt-2 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {getDuplicateMessage()}
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
          onClose={handleDialogClose}
          duplicateResult={duplicateResult}
        />
      )}
    </>
  );
};
