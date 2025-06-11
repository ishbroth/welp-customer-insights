import { useState, useEffect } from "react";
import { checkEmailExistsViaEdgeFunction, checkPhoneExistsViaEdgeFunction, checkDuplicatesViaEdgeFunction } from "@/services/duplicateAccount/edgeFunctionChecker";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";

interface UseDuplicateCheckerProps {
  businessEmail: string;
  businessPhone: string;
  businessName: string;
  businessAddress: string;
  onDuplicateFound?: (hasDuplicate: boolean) => void;
}

export const useDuplicateChecker = ({
  businessEmail,
  businessPhone,
  businessName,
  businessAddress,
  onDuplicateFound
}: UseDuplicateCheckerProps) => {
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

  return {
    duplicateResult,
    showDuplicateDialog,
    isCheckingDuplicates,
    emailExists,
    phoneExists,
    hasDuplicates,
    handleDialogClose
  };
};
