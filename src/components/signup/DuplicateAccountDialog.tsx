
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DuplicateCheckResult } from "@/services/duplicateAccountService";
import { PasswordResetDialog } from "./PasswordResetDialog";
import { DuplicateDialogActions } from "./DuplicateDialogActions";
import { getDuplicateMessage, getDialogTitle } from "./duplicateDialogUtils";

interface DuplicateAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateResult: DuplicateCheckResult;
}

export const DuplicateAccountDialog = ({
  isOpen,
  onClose,
  duplicateResult
}: DuplicateAccountDialogProps) => {
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  if (showPasswordReset) {
    return (
      <PasswordResetDialog
        isOpen={isOpen}
        onClose={onClose}
        onBack={() => setShowPasswordReset(false)}
        initialEmail={duplicateResult.existingEmail || ''}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle(duplicateResult)}</DialogTitle>
          <DialogDescription>
            {getDuplicateMessage(duplicateResult)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <DuplicateDialogActions
            duplicateResult={duplicateResult}
            onClose={onClose}
            onShowPasswordReset={() => setShowPasswordReset(true)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
