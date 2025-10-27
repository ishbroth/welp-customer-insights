
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useAccountDeletion } from "@/hooks/useAccountDeletion";
import AccountDeletionSuccessPopup from "./AccountDeletionSuccessPopup";

const DeleteAccountSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteAccount, isDeleting, showSuccessPopup, handleSuccessPopupClose } = useAccountDeletion();

  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-red-600">
            <p className="mb-2">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {!isExpanded && (
              <Button
                variant="outline"
                onClick={() => setIsExpanded(true)}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Show Delete Options
              </Button>
            )}
            
            {isExpanded && (
              <div className="space-y-3 p-4 border border-red-200 rounded-md bg-white">
                <div className="text-sm">
                  <h4 className="font-semibold mb-2">What will be deleted:</h4>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>Your user profile and account</li>
                    <li>All reviews you've written about customers</li>
                    <li>All responses and interactions</li>
                    <li>Business information and verification data</li>
                    <li>Credit transactions and subscription data</li>
                    <li>All stored personal information</li>
                  </ul>
                </div>
                
                <div className="pt-3 border-t border-red-200">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsExpanded(false)}
                      disabled={isDeleting}
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Deleting Account...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete My Account
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AccountDeletionSuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
      />
    </>
  );
};

export default DeleteAccountSection;
