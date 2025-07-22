
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface VerifyEmailCodeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const VerifyEmailCodeButton = ({
  onClick,
  isLoading,
  disabled = false
}: VerifyEmailCodeButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="welp-button w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        "Verify Email"
      )}
    </Button>
  );
};

export default VerifyEmailCodeButton;
