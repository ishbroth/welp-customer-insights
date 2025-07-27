
import { useState, useEffect } from "react";
import { checkEmailExistsViaEdgeFunction, checkPhoneExistsViaEdgeFunction } from "@/services/duplicateAccount/edgeFunctionChecker";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";

interface UseDuplicateCheckerProps {
  businessEmail: string;
  businessPhone: string;
  businessName: string;
  businessAddress?: string;
  onDuplicateFound?: (hasDuplicate: boolean) => void;
}

export const useDuplicateChecker = ({
  businessEmail,
  businessPhone,
  businessName,
  businessAddress = "",
  onDuplicateFound
}: UseDuplicateCheckerProps) => {
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);

  // Immediate email duplicate check
  useEffect(() => {
    if (!businessEmail || !businessEmail.includes('@')) {
      setEmailExists(false);
      if (duplicateResult?.duplicateType === 'email') {
        setDuplicateResult(null);
        setShowDuplicateDialog(false);
        onDuplicateFound?.(false);
      }
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      console.log("🔍 CHECKING EMAIL DUPLICATE");
      console.log("Checking email:", businessEmail);
      
      setIsCheckingDuplicates(true);
      
      try {
        const exists = await checkEmailExistsViaEdgeFunction(businessEmail, 'business');
        console.log("Email exists result:", exists);
        
        setEmailExists(exists);
        
        if (exists) {
          const result: DuplicateCheckResult = {
            isDuplicate: true,
            duplicateType: 'email',
            existingEmail: businessEmail,
            allowContinue: false
          };
          setDuplicateResult(result);
          setShowDuplicateDialog(true);
          onDuplicateFound?.(true);
        } else {
          // Clear email-related duplicate result
          if (duplicateResult?.duplicateType === 'email') {
            setDuplicateResult(null);
            setShowDuplicateDialog(false);
            onDuplicateFound?.(false);
          }
        }
      } catch (error) {
        console.error("Error checking email duplicate:", error);
        setEmailExists(false);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [businessEmail, duplicateResult?.duplicateType, onDuplicateFound]);

  // Immediate phone duplicate check
  useEffect(() => {
    if (!businessPhone || businessPhone.replace(/\D/g, '').length < 10) {
      setPhoneExists(false);
      if (duplicateResult?.duplicateType === 'phone') {
        setDuplicateResult(null);
        setShowDuplicateDialog(false);
        onDuplicateFound?.(false);
      }
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      console.log("🔍 CHECKING PHONE DUPLICATE");
      console.log("Checking phone:", businessPhone);
      
      setIsCheckingDuplicates(true);
      
      try {
        const exists = await checkPhoneExistsViaEdgeFunction(businessPhone, 'business');
        console.log("Phone exists result:", exists);
        
        setPhoneExists(exists);
        
        if (exists) {
          const result: DuplicateCheckResult = {
            isDuplicate: true,
            duplicateType: 'phone',
            existingPhone: businessPhone,
            allowContinue: false
          };
          setDuplicateResult(result);
          setShowDuplicateDialog(true);
          onDuplicateFound?.(true);
        } else {
          // Clear phone-related duplicate result
          if (duplicateResult?.duplicateType === 'phone') {
            setDuplicateResult(null);
            setShowDuplicateDialog(false);
            onDuplicateFound?.(false);
          }
        }
      } catch (error) {
        console.error("Error checking phone duplicate:", error);
        setPhoneExists(false);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [businessPhone, duplicateResult?.duplicateType, onDuplicateFound]);

  const handleDialogClose = () => {
    setShowDuplicateDialog(false);
  };

  return {
    duplicateResult,
    showDuplicateDialog,
    isCheckingDuplicates,
    emailExists,
    phoneExists,
    handleDialogClose
  };
};
