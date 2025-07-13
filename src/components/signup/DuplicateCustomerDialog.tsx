
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";
import { getDuplicateMessage, getDialogTitle } from "./duplicateDialogUtils";

interface DuplicateCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  duplicateResult: DuplicateCheckResult | null;
}

export const DuplicateCustomerDialog = ({
  isOpen,
  onClose,
  onContinue,
  duplicateResult
}: DuplicateCustomerDialogProps) => {
  if (!duplicateResult) return null;

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getDialogTitle(duplicateResult)}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDuplicateMessage(duplicateResult)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!duplicateResult.allowContinue ? (
            <>
              <AlertDialogCancel onClick={onClose}>
                Use Different Email
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSignIn}>
                Sign In Instead
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel onClick={onClose}>
                Go Back
              </AlertDialogCancel>
              <AlertDialogAction onClick={onContinue}>
                Continue Anyway
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
