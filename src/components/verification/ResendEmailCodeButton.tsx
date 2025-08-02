
import React from 'react';
import { Button } from "@/components/ui/button";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

interface ResendEmailCodeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  timer: number;
}

const ResendEmailCodeButton: React.FC<ResendEmailCodeButtonProps> = ({ 
  onClick, 
  isLoading, 
  disabled, 
  timer 
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <WelpLoadingIcon size={16} className="mr-2" />
          Sending...
        </>
      ) : disabled ? (
        `Resend Code (${timer}s)`
      ) : (
        "Resend Code"
      )}
    </Button>
  );
};

export default ResendEmailCodeButton;
