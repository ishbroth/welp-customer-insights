
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface VerifyEmailCodeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const VerifyEmailCodeButton: React.FC<VerifyEmailCodeButtonProps> = ({ 
  onClick, 
  isLoading, 
  disabled 
}) => {
  return (
    <Button
      className="w-full"
      onClick={onClick}
      disabled={disabled || isLoading}
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
