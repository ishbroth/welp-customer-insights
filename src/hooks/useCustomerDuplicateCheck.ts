import { useState, useEffect, useCallback } from "react";
import { checkEmailExistsViaEdgeFunction, checkPhoneExistsViaEdgeFunction, checkDuplicatesViaEdgeFunction } from "@/services/duplicateAccount/edgeFunctionChecker";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useCustomerDuplicateCheck');

export const useCustomerDuplicateCheck = (email: string, phone: string, firstName?: string, lastName?: string) => {
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [emailExistsCheck, setEmailExistsCheck] = useState(false);
  const [dismissedDuplicates, setDismissedDuplicates] = useState<Set<string>>(new Set());

  // Check phone existence
  useEffect(() => {
    if (!phone || phone.length < 10) {
      setPhoneExists(false);
      return;
    }

    setIsChecking(true);
    const timeoutId = setTimeout(async () => {
      try {
        hookLogger.debug("=== PHONE EXISTENCE CHECK START ===");

        const exists = await checkPhoneExistsViaEdgeFunction(phone, 'customer');
        hookLogger.debug("Phone check result:", exists);
        
        if (exists) {
          setPhoneExists(true);
          const result: DuplicateCheckResult = {
            isDuplicate: true,
            duplicateType: 'phone',
            existingPhone: phone,
            allowContinue: false
          };
          setDuplicateResult(result);
          
          // Only show dialog if not already dismissed for this phone
          if (!dismissedDuplicates.has(phone)) {
            setShowDuplicateDialog(true);
          }
        } else {
          setPhoneExists(false);
          // Clear duplicate result if phone is no longer duplicate
          if (duplicateResult?.duplicateType === 'phone') {
            setDuplicateResult(null);
          }
        }
      } catch (error) {
        hookLogger.error("Error checking phone duplicates:", error);
        setPhoneExists(false);
      } finally {
        setIsChecking(false);
        hookLogger.debug("=== PHONE EXISTENCE CHECK END ===");
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [phone]);

  // Check email existence
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailExistsCheck(false);
      return;
    }

    setIsChecking(true);
    const timeoutId = setTimeout(async () => {
      try {
        hookLogger.debug("=== EMAIL EXISTENCE CHECK START ===");

        const exists = await checkEmailExistsViaEdgeFunction(email, 'customer');
        hookLogger.debug("Email check result:", exists);
        
        if (exists) {
          setEmailExistsCheck(true);
          const result: DuplicateCheckResult = {
            isDuplicate: true,
            duplicateType: 'email',
            existingEmail: email,
            allowContinue: false
          };
          setDuplicateResult(result);
          
          // Only show dialog if not already dismissed for this email
          if (!dismissedDuplicates.has(email)) {
            setShowDuplicateDialog(true);
          }
        } else {
          setEmailExistsCheck(false);
          // Clear duplicate result if email is no longer duplicate
          if (duplicateResult?.duplicateType === 'email') {
            setDuplicateResult(null);
          }
        }
      } catch (error) {
        hookLogger.error("Error checking email duplicates:", error);
        setEmailExistsCheck(false);
      } finally {
        setIsChecking(false);
        hookLogger.debug("=== EMAIL EXISTENCE CHECK END ===");
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [email]);

  // Comprehensive duplicate check (when all fields are provided)
  useEffect(() => {
    if (!email || !phone || !firstName || !lastName || phoneExists || emailExistsCheck) {
      return;
    }

    setIsChecking(true);
    const timeoutId = setTimeout(async () => {
      try {
        hookLogger.debug("=== COMPREHENSIVE CUSTOMER DUPLICATE CHECK START ===");
        hookLogger.debug("Checking comprehensive duplicates for:", { email, phone, firstName, lastName });

        const result = await checkDuplicatesViaEdgeFunction(email, phone, firstName, lastName, 'customer');
        hookLogger.debug("Comprehensive duplicate check result:", result);
        
        if (result.isDuplicate) {
          setDuplicateResult(result);
          
          // Only show dialog if not already dismissed for this combination
          const dismissKey = `${email}-${phone}`;
          if (!dismissedDuplicates.has(dismissKey)) {
            setShowDuplicateDialog(true);
          }
        } else {
          setDuplicateResult(null);
        }
      } catch (error) {
        hookLogger.error("Error in comprehensive duplicate check:", error);
        setDuplicateResult(null);
      } finally {
        setIsChecking(false);
        hookLogger.debug("=== COMPREHENSIVE CUSTOMER DUPLICATE CHECK END ===");
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [email, phone, firstName, lastName, phoneExists, emailExistsCheck]);

  const handleDismissDuplicate = useCallback(() => {
    if (duplicateResult?.existingEmail) {
      setDismissedDuplicates(prev => new Set(prev).add(duplicateResult.existingEmail!));
    }
    if (duplicateResult?.existingPhone) {
      setDismissedDuplicates(prev => new Set(prev).add(duplicateResult.existingPhone!));
    }
    // Add combination key for comprehensive checks
    const dismissKey = `${email}-${phone}`;
    setDismissedDuplicates(prev => new Set(prev).add(dismissKey));
    
    setShowDuplicateDialog(false);
  }, [duplicateResult, email, phone]);

  return {
    duplicateResult,
    showDuplicateDialog,
    setShowDuplicateDialog,
    isChecking,
    phoneExists,
    emailExistsCheck,
    setDuplicateResult,
    handleDismissDuplicate
  };
};