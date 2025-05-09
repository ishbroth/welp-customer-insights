
import { Button } from "@/components/ui/button";

interface ResendCodeButtonProps {
  onResend: () => void;
  isDisabled: boolean;
  isResending: boolean;
  timer: number;
}

const ResendCodeButton = ({
  onResend,
  isDisabled,
  isResending,
  timer
}: ResendCodeButtonProps) => {
  return (
    <div className="text-center text-sm text-gray-500">
      Didn't receive the code?
      <Button 
        variant="link" 
        onClick={onResend}
        disabled={isDisabled || isResending}
      >
        {isResending ? "Resending..." : `Resend code ${isDisabled ? `(${timer}s)` : ""}`}
      </Button>
    </div>
  );
};

export default ResendCodeButton;
