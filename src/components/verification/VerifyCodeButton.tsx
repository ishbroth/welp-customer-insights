
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from 'lucide-react';
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

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
          <WelpLoadingIcon size={18} className="mr-2" />
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
