
import React from 'react';
import { Button } from "@/components/ui/button";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

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
          <WelpLoadingIcon size={16} className="mr-2" />
          Verifying...
        </>
      ) : (
        "Verify Email"
      )}
    </Button>
  );
};

export default VerifyEmailCodeButton;
