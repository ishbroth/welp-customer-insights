
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ResendEmailCodeButtonProps {
  onResend: () => void;
  isDisabled: boolean;
  isResending: boolean;
  timer: number;
}

const ResendEmailCodeButton = ({
  onResend,
  isDisabled,
  isResending,
  timer
}: ResendEmailCodeButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onResend}
      disabled={isDisabled || isResending}
      className="w-full"
    >
      {isResending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : isDisabled ? (
        `Resend code in ${timer}s`
      ) : (
        "Resend verification code"
      )}
    </Button>
  );
};

export default ResendEmailCodeButton;
