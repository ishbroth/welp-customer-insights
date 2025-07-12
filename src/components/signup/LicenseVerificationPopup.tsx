
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface LicenseVerificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  verificationResult: any;
  businessName: string;
  licenseNumber: string;
}

const LicenseVerificationPopup = ({
  isOpen,
  onClose,
  verificationResult,
  businessName,
  licenseNumber
}: LicenseVerificationPopupProps) => {
  if (!verificationResult) return null;

  const { verified, message, details, isRealVerification } = verificationResult;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {verified ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                License Verified!
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Verification Failed
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Business Details</h4>
            <p><strong>Name:</strong> {businessName}</p>
            <p><strong>License:</strong> {licenseNumber}</p>
          </div>

          {verified ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Verification Successful</h4>
              {isRealVerification && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Real-time Verified
                  </span>
                </div>
              )}
              
              {details && (
                <div className="text-sm text-green-700 space-y-1">
                  {details.type && <p><strong>Type:</strong> {details.type}</p>}
                  {details.status && <p><strong>Status:</strong> {details.status}</p>}
                  {details.issuingAuthority && <p><strong>Authority:</strong> {details.issuingAuthority}</p>}
                  {details.expirationDate && <p><strong>Expires:</strong> {details.expirationDate}</p>}
                </div>
              )}
              
              <p className="text-sm text-green-700 mt-2">
                Your business license has been successfully verified. You can proceed with account creation.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Verification Failed</h4>
              <p className="text-sm text-red-700 mb-2">{message}</p>
              
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Don't worry!</p>
                    <p>You can still continue with account creation. Manual verification will be required after registration.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose} className="welp-button">
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseVerificationPopup;
