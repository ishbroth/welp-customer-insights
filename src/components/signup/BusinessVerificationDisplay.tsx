
import { Button } from "@/components/ui/button";

interface VerificationData {
  name: string;
  email: string;
  address: string;
  phone?: string;
  licenseType?: string;
  licenseStatus?: string;
  licenseExpiration?: string;
  verificationMethod?: string;
  isFullyVerified?: boolean;
}

interface BusinessVerificationDisplayProps {
  verificationData: VerificationData;
  onContinue: () => void;
  onEdit: () => void;
}

export const BusinessVerificationDisplay = ({
  verificationData,
  onContinue,
  onEdit
}: BusinessVerificationDisplayProps) => {
  return (
    <div className="mt-6 p-4 border-2 border-green-500 bg-green-50 rounded-md">
      <h3 className="text-lg font-semibold text-green-700 mb-2">
        {verificationData.isFullyVerified === false ? "Business Partially Verified" : "Business Verified"}
      </h3>
      <div className="space-y-2 text-sm">
        <p><strong>Name:</strong> {verificationData.name}</p>
        <p><strong>Email:</strong> {verificationData.email}</p>
        <p><strong>Address:</strong> {verificationData.address}</p>
        {verificationData.licenseType && (
          <p><strong>License Type:</strong> {verificationData.licenseType}</p>
        )}
        {verificationData.licenseStatus && (
          <p><strong>License Status:</strong> <span className="text-green-600 font-medium">{verificationData.licenseStatus}</span></p>
        )}
        {verificationData.verificationMethod === "phone" && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-amber-800">
              <strong>Note:</strong> Your account will have limited functionality until your business is fully verified.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="mb-2">Does this information look correct?</p>
        <div className="flex space-x-3">
          <Button onClick={onContinue} className="welp-button">
            Yes, Continue
          </Button>
          <Button onClick={onEdit} variant="outline">
            No, Edit Information
          </Button>
        </div>
      </div>
    </div>
  );
};
