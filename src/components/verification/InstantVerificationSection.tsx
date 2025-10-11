
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { verifyBusinessId } from "@/utils/businessVerification";
import { logger } from "@/utils/logger";

interface InstantVerificationSectionProps {
  primaryLicense: string;
  licenseState: string;
  licenseType: string;
  businessSubcategory: string;
  businessName: string;
  currentUserId?: string;
  state: string;
  onVerificationSuccess: (details: any) => void;
}

const InstantVerificationSection = ({
  primaryLicense,
  licenseState,
  licenseType,
  businessSubcategory,
  businessName,
  currentUserId,
  state,
  onVerificationSuccess
}: InstantVerificationSectionProps) => {
  const componentLogger = logger.withContext('InstantVerificationSection');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleInstantVerification = async () => {
    if (!primaryLicense || !licenseState || !licenseType) {
      setError("Please fill in license number, state, and license type first");
      return;
    }

    setIsVerifying(true);
    setError("");
    setVerificationResult(null);

    try {
      componentLogger.debug("Starting instant verification with:", {
        primaryLicense,
        licenseType,
        licenseState,
        businessSubcategory
      });

      // Use the actual selected license type instead of hardcoded "Business License"
      const result = await verifyBusinessId(primaryLicense, licenseType, licenseState);

      componentLogger.debug("Instant verification result:", result);
      
      setVerificationResult(result);
      
      if (result.verified && result.isRealVerification) {
        onVerificationSuccess({
          businessName,
          verificationDetails: {
            type: licenseType,
            status: result.details?.status || "Active",
            issuingAuthority: result.details?.issuingAuthority || `${licenseState} State Database`,
            licenseState: licenseState,
            businessSubcategory: businessSubcategory
          }
        });
      }
    } catch (error) {
      componentLogger.error("Instant verification error:", error);
      setError("Verification failed. Please try again or proceed with manual verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Button is only enabled when all required fields are filled
  const isButtonEnabled = primaryLicense && licenseState && licenseType && !isVerifying;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Instant Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Try instant verification first for immediate results. Requires license number, state, and license type.
        </p>
        
        <Button
          type="button"
          onClick={handleInstantVerification}
          disabled={!isButtonEnabled}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : "Verify Instantly"}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {verificationResult && (
          <div className="space-y-2">
            {verificationResult.verified && verificationResult.isRealVerification ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">License verified successfully!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Could not verify instantly. Please continue with manual verification.
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstantVerificationSection;
