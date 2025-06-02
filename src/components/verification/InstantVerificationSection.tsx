
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { verifyBusinessId } from "@/utils/businessVerification";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface InstantVerificationSectionProps {
  primaryLicense: string;
  businessType: string;
  licenseState: string;
  businessName: string;
  currentUserId?: string;
  state: string;
  onVerificationSuccess: (details: any) => void;
}

const InstantVerificationSection = ({
  primaryLicense,
  businessType,
  licenseState,
  businessName,
  currentUserId,
  state,
  onVerificationSuccess
}: InstantVerificationSectionProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [instantVerified, setInstantVerified] = useState(false);

  const handleInstantVerification = async () => {
    if (!primaryLicense || !businessType) {
      toast.error("Please enter your license number and select business type first");
      return;
    }

    setIsVerifying(true);
    setVerificationAttempted(true);

    try {
      const result = await verifyBusinessId(
        primaryLicense, 
        businessType, 
        licenseState || state
      );

      if (result.verified && result.isRealVerification) {
        setInstantVerified(true);
        const verificationDetails = {
          businessName,
          verificationDetails: result.details || {
            type: "Business License",
            status: "Active"
          }
        };

        // Update business_info table immediately
        if (currentUserId) {
          const { error: updateError } = await supabase
            .from('business_info')
            .upsert({
              id: currentUserId,
              business_name: businessName,
              license_number: primaryLicense,
              license_type: businessType,
              license_state: licenseState || state,
              verified: true,
              license_status: result.details?.status || "Active",
              additional_info: `Real-time verified: ${result.details?.issuingAuthority || 'State Database'}`
            });

          if (updateError) {
            console.error("Error updating business info:", updateError);
          }
        }

        onVerificationSuccess(verificationDetails);
        toast.success("License verified successfully!");
      } else {
        toast.error(result.message || "Could not verify license automatically. Please submit manual verification request.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("An error occurred during verification. Please try manual submission.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!primaryLicense || !businessType) {
    return null;
  }

  if (instantVerified) {
    return (
      <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center text-green-800">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-semibold">License Verified Successfully!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Your business has been verified through real-time license verification. No further action needed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="md:col-span-2">
        <Button
          type="button"
          onClick={handleInstantVerification}
          disabled={isVerifying}
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying License...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Try Instant Verification
            </>
          )}
        </Button>
        {verificationAttempted && !instantVerified && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            Instant verification not available for this license. Please continue with manual verification below.
          </p>
        )}
      </div>
    </>
  );
};

export default InstantVerificationSection;
