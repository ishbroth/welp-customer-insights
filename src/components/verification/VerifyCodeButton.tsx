
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from 'lucide-react';

interface VerifyCodeButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const VerifyCodeButton = ({ onClick, isLoading }: VerifyCodeButtonProps) => {
  return (
    <Button 
      className="welp-button w-full" 
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 4V2m0 18v-2m5.66-1.34L18.34 17l1.32-1.32M5.06 6.46 6.46 5.06 7.78 6.38M19.92 12h-2m-14 0H4m5.66 1.34L5.06 17l-1.32-1.32M18.94 6.46l-1.4 1.4L16.22 6.38M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/>
          </svg>
          Verifying Code...
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Verify Code
        </>
      )}
    </Button>
  );
};

export default VerifyCodeButton;
