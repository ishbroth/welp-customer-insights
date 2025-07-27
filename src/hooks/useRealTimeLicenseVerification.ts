
import { useState, useEffect } from "react";
import { verifyBusinessId } from "@/utils/businessVerification";
import { toast } from "@/hooks/use-toast";

export const useRealTimeLicenseVerification = (
  licenseNumber: string,
  businessType: string,
  businessState: string
) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    // Reset state when inputs change
    setIsVerified(false);
    setVerificationResult(null);
    setHasAttempted(false);

    // Only verify if all required fields are present and license number is substantial
    if (!licenseNumber?.trim() || !businessType?.trim() || !businessState?.trim()) {
      return;
    }

    // Only verify if license number looks substantial (at least 4 characters)
    if (licenseNumber.trim().length < 4) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsVerifying(true);
      setHasAttempted(true);
      
      try {
        console.log("🔍 Real-time license verification with proper license type:", {
          licenseNumber: licenseNumber.trim(),
          businessType,
          businessState
        });

        // Use the actual businessType instead of hardcoded value
        const result = await verifyBusinessId(
          licenseNumber.trim(),
          businessType,
          businessState
        );

        console.log("📋 Real-time license verification result:", result);
        
        setVerificationResult(result);
        setIsVerified(result.verified && result.isRealVerification);

        // Show toast for verification failure
        if (!result.verified) {
          toast({
            title: "Verification Status",
            description: "We were unable to automatically verify your license, please submit a verification request, it's free!",
            duration: 5000,
            action: (
              <button
                onClick={() => {
                  window.location.href = "/verify-license";
                }}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Submit Request
              </button>
            )
          });
        }
      } catch (error) {
        console.error("❌ Real-time license verification error:", error);
        setVerificationResult({
          verified: false,
          message: "Verification temporarily unavailable",
          isRealVerification: false
        });
      } finally {
        setIsVerifying(false);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [licenseNumber, businessType, businessState]);

  return {
    isVerifying,
    isVerified,
    verificationResult,
    hasAttempted
  };
};
