
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { verifyBusinessId } from "@/utils/businessVerification";

interface InstantVerificationSectionProps {
  primaryLicense: string;
  licenseState: string;
  businessName: string;
  currentUserId?: string;
  state: string;
  onVerificationSuccess: (details: any) => void;
}

const InstantVerificationSection = ({
  primaryLicense,
  licenseState,
  businessName,
  currentUserId,
  state,
  onVerificationSuccess
}: InstantVerificationSectionProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleInstantVerification = async () => {
    if (!primaryLicense || !licenseState) {
      setError("Please fill in license number and state first");
      return;
    }

    setIsVerifying(true);
    setError("");
    setVerificationResult(null);

    try {
      // Use "Business License" as default license type for instant verification
      const result = await verifyBusinessId(primaryLicense, "Business License", licenseState);
      
      setVerificationResult(result);
      
      if (result.verified && result.isRealVerification) {
        onVerificationSuccess({
          businessName,
          verificationDetails: {
            type: result.details?.type || "Business License",
            status: result.details?.status || "Active",
            issuingAuthority: result.details?.issuingAuthority || `${licenseState} State Database`,
            licenseState: licenseState
          }
        });
      }
    } catch (error) {
      console.error("Instant verification error:", error);
      setError("Verification failed. Please try again or proceed with manual verification.");
    } finally {
      setIsVerifying(false);
    }
  };

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
          Try instant verification first for immediate results
        </p>
        
        <Button
          type="button"
          onClick={handleInstantVerification}
          disabled={isVerifying || !primaryLicense || !licenseState}
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
