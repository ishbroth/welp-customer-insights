
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LicenseVerificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  isVerified: boolean;
  verificationDetails?: any;
}

export const LicenseVerificationPopup = ({
  isOpen,
  onClose,
  businessName,
  isVerified,
  verificationDetails
}: LicenseVerificationPopupProps) => {
  const navigate = useNavigate();

  const handleContinueToProfile = () => {
    onClose();
    navigate('/profile');
  };

  const handleRequestVerification = () => {
    onClose();
    navigate('/verify-license');
  };

  const handleSkipForNow = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isVerified ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />
                License Verified!
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
                License Verification
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isVerified ? (
            <>
              <p className="text-green-700">
                Congratulations! Your business license has been successfully verified through our automated system.
              </p>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-800">{businessName}</p>
                {verificationDetails && (
                  <p className="text-sm text-green-700">
                    Verified with {verificationDetails.issuingAuthority || 'state database'}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Your business profile will display a verified badge, and your reviews will rank higher in search results.
              </p>
              <Button 
                onClick={handleContinueToProfile}
                className="w-full welp-button"
              >
                Continue to Profile
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-700">
                We were unable to automatically verify your business license at this time. This could be due to:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>License database temporarily unavailable</li>
                <li>Recent license issuance not yet in system</li>
                <li>License type not supported for automatic verification</li>
              </ul>
              <p className="text-gray-700">
                You can request manual verification now or continue with an unverified account.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleRequestVerification}
                  className="w-full welp-button"
                >
                  Request Manual Verification
                </Button>
                <Button 
                  onClick={handleSkipForNow}
                  variant="outline"
                  className="w-full"
                >
                  Skip for Now
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Note: Unverified businesses may rank lower in search results until verification is complete.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
