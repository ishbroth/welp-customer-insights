import { useState, useEffect } from "react";
import { checkEmailExistsViaEdgeFunction, checkPhoneExistsViaEdgeFunction, checkDuplicatesViaEdgeFunction } from "@/services/duplicateAccount/edgeFunctionChecker";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";

export const useCustomerDuplicateCheck = (email: string, phone: string, firstName: string, lastName: string) => {
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [emailExistsCheck, setEmailExistsCheck] = useState(false);
  const [dismissedDuplicates, setDismissedDuplicates] = useState<Set<string>>(new Set());

  // Check phone immediately when it changes using edge function
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (phone && phone.replace(/\D/g, '').length >= 10) {
        console.log("=== CUSTOMER PHONE CHECK VIA EDGE FUNCTION ===");
        console.log("Checking phone:", phone);
        setIsChecking(true);
        try {
          const exists = await checkPhoneExistsViaEdgeFunction(phone, 'customer');
          console.log("Phone exists result via edge function:", exists);
          setPhoneExists(exists);
          
          if (exists) {
            const result: DuplicateCheckResult = {
              isDuplicate: true,
              duplicateType: 'phone',
              existingPhone: phone,
              allowContinue: false
            };
            setDuplicateResult(result);
            
            // Only show dialog if not previously dismissed
            if (!dismissedDuplicates.has(phone)) {
              setShowDuplicateDialog(true);
            }
          } else {
            // Clear duplicate result if phone doesn't exist and current duplicate is phone-related
            if (duplicateResult?.duplicateType === 'phone') {
              setDuplicateResult(null);
              setShowDuplicateDialog(false);
            }
          }
        } catch (error) {
          console.error("Error checking customer phone via edge function:", error);
        } finally {
          setIsChecking(false);
        }
      } else {
        // Reset phone exists state when phone is cleared or too short
        setPhoneExists(false);
        // Clear duplicate result when phone is cleared and it's phone-related
        if (duplicateResult?.duplicateType === 'phone') {
          setDuplicateResult(null);
          setShowDuplicateDialog(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [phone, duplicateResult?.duplicateType, dismissedDuplicates]);

  // Check email immediately when it changes using edge function
  useEffect(() => {
    // Clear dismissed duplicates when email changes to allow new checks
    if (email) {
      setDismissedDuplicates(prev => {
        const newSet = new Set(prev);
        // Remove any previously dismissed email duplicates when email changes
        Array.from(newSet).forEach(key => {
          if (key.includes('@')) newSet.delete(key);
        });
        return newSet;
      });
    }

    const timeoutId = setTimeout(async () => {
      if (email && email.includes('@')) {
        console.log("=== CUSTOMER EMAIL CHECK VIA EDGE FUNCTION ===");
        console.log("Checking email:", email);
        setIsChecking(true);
        try {
          const exists = await checkEmailExistsViaEdgeFunction(email, 'customer');
          console.log("Email exists result via edge function:", exists);
          setEmailExistsCheck(exists);
          
          if (exists) {
            const result: DuplicateCheckResult = {
              isDuplicate: true,
              duplicateType: 'email',
              existingEmail: email,
              allowContinue: false
            };
            setDuplicateResult(result);
            
            // Only show dialog if not previously dismissed
            if (!dismissedDuplicates.has(email)) {
              setShowDuplicateDialog(true);
            }
          } else {
            // Clear duplicate result if email doesn't exist and current duplicate is email-related
            if (duplicateResult?.duplicateType === 'email') {
              setDuplicateResult(null);
              setShowDuplicateDialog(false);
            }
          }
        } catch (error) {
          console.error("Error checking customer email via edge function:", error);
        } finally {
          setIsChecking(false);
        }
      } else {
        // Reset email exists state when email is cleared or invalid
        setEmailExistsCheck(false);
        // Clear duplicate result when email is cleared and it's email-related
        if (duplicateResult?.duplicateType === 'email') {
          setDuplicateResult(null);
          setShowDuplicateDialog(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email, duplicateResult?.duplicateType, dismissedDuplicates]);

  // Enhanced duplicate checking specifically for customer accounts using edge function
  useEffect(() => {
    if (!email || !phone || !firstName || !lastName) return;
    
    const timeoutId = setTimeout(async () => {
      console.log("=== COMPREHENSIVE CUSTOMER DUPLICATE CHECK VIA EDGE FUNCTION ===");
      console.log("Checking for customer duplicates:", { email, phone, firstName, lastName });
      
      setIsChecking(true);
      try {
        const result = await checkDuplicatesViaEdgeFunction(email, phone, undefined, undefined, 'customer');
        console.log("Customer duplicate check result via edge function:", result);
        
        if (result.isDuplicate && !phoneExists && !emailExistsCheck) {
          setDuplicateResult(result);
          
          // Only show dialog if not previously dismissed
          const dismissKey = `${email}-${phone}`;
          if (!dismissedDuplicates.has(dismissKey)) {
            setShowDuplicateDialog(true);
          }
        } else if (!result.isDuplicate && !phoneExists && !emailExistsCheck) {
          // Clear duplicate result if comprehensive check finds no duplicates
          setDuplicateResult(null);
          setShowDuplicateDialog(false);
        }
      } catch (error) {
        console.error("Error checking for customer duplicates via edge function:", error);
      } finally {
        setIsChecking(false);
        console.log("=== COMPREHENSIVE CUSTOMER DUPLICATE CHECK END ===");
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [email, phone, firstName, lastName, phoneExists, emailExistsCheck, dismissedDuplicates]);

  const handleDismissDuplicate = () => {
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
  };

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