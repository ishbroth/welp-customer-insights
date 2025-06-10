
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";

interface DuplicateDialogActionsProps {
  duplicateResult: DuplicateCheckResult;
  onClose: () => void;
  onShowPasswordReset: () => void;
}

export const DuplicateDialogActions = ({
  duplicateResult,
  onClose,
  onShowPasswordReset
}: DuplicateDialogActionsProps) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login', { 
      state: { 
        email: duplicateResult.existingEmail 
      }
    });
  };

  const handleForgotPassword = () => {
    onShowPasswordReset();
  };

  // Always show sign in and forgot password options for duplicates
  return (
    <>
      <Button
        onClick={handleSignIn}
        className="welp-button w-full"
      >
        Sign In Instead
      </Button>
      
      <Button
        onClick={handleForgotPassword}
        variant="outline"
        className="w-full"
      >
        Forgot Password?
      </Button>
    </>
  );
};
