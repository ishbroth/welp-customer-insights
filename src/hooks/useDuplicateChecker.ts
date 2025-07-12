
import { useState, useEffect } from "react";
import { checkDuplicatesViaEdgeFunction } from "@/services/duplicateAccount/edgeFunctionChecker";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";
import { debugOrphanedData } from "@/utils/debugOrphanedData";

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

  // Enhanced duplicate checking with debug logging
  useEffect(() => {
    if (!businessEmail || !businessPhone || !businessName) return;
    
    const timeoutId = setTimeout(async () => {
      console.log("🔍 COMPREHENSIVE DUPLICATE CHECK WITH DEBUG");
      console.log("Checking:", { businessEmail, businessPhone, businessName, businessAddress });
      
      setIsCheckingDuplicates(true);
      
      try {
        // CRITICAL: Add debug logging before duplicate check
        const debugInfo = await debugOrphanedData(businessPhone);
        console.log("🔍 DEBUG: Orphaned data check results:", debugInfo);
        
        const result = await checkDuplicatesViaEdgeFunction(
          businessEmail, 
          businessPhone, 
          businessName, 
          businessAddress, 
          'business'
        );
        
        console.log("🔍 Duplicate check result:", result);
        
        if (result.isDuplicate) {
          setDuplicateResult(result);
          setShowDuplicateDialog(true);
          
          // Set specific flags based on duplicate type
          if (result.duplicateType === 'email') {
            setEmailExists(true);
            setPhoneExists(false);
          } else if (result.duplicateType === 'phone') {
            setEmailExists(false);
            setPhoneExists(true);
          }
          
          onDuplicateFound?.(true);
        } else {
          setDuplicateResult(null);
          setShowDuplicateDialog(false);
          setEmailExists(false);
          setPhoneExists(false);
          onDuplicateFound?.(false);
        }
      } catch (error) {
        console.error("Error in duplicate check:", error);
        onDuplicateFound?.(false);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [businessEmail, businessPhone, businessName, businessAddress, onDuplicateFound]);

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
