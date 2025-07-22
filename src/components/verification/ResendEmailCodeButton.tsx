
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
