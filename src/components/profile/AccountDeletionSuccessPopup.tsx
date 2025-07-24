
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface AccountDeletionSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountDeletionSuccessPopup = ({ isOpen, onClose }: AccountDeletionSuccessPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-green-700">
            Account Deleted Successfully
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Your account and all associated data have been permanently removed from our system.
          </p>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-700 space-y-1">
              <p>✓ Account and profile deleted</p>
              <p>✓ All reviews and responses removed</p>
              <p>✓ Business information cleared</p>
              <p>✓ All personal data permanently removed</p>
            </div>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDeletionSuccessPopup;
