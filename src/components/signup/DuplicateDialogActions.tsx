
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DuplicateCheckResult } from "@/services/duplicateAccountService";

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
    navigate('/forgot-password', { 
      state: { 
        email: duplicateResult.existingEmail 
      }
    });
  };

  if (!duplicateResult.allowContinue) {
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
  }

  return (
    <>
      <Button
        onClick={onClose}
        className="welp-button w-full"
      >
        Continue Anyway
      </Button>
      
      {(duplicateResult.duplicateType === 'business_name' || 
        duplicateResult.duplicateType === 'customer_name') && (
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full"
        >
          Go Back and Change Information
        </Button>
      )}
    </>
  );
};
