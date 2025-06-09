
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DuplicateCheckResult } from "@/services/duplicateAccountService";

interface DuplicateAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateResult: DuplicateCheckResult;
}

export const DuplicateAccountDialog = ({
  isOpen,
  onClose,
  duplicateResult
}: DuplicateAccountDialogProps) => {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState(duplicateResult.existingEmail || '');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/reset-password",
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your inbox for password reset instructions.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const getDuplicateMessage = () => {
    switch (duplicateResult.duplicateType) {
      case 'email':
        return `An account with the email ${duplicateResult.existingEmail} already exists.`;
      case 'business_name':
        return `A business with this name and phone number already exists. You can continue if this is a different location.`;
      case 'customer_name':
        return `A customer with this name and phone number already exists. You can continue if this is a different person with the same name.`;
      default:
        return "An account with this information already exists.";
    }
  };

  const getDialogTitle = () => {
    switch (duplicateResult.duplicateType) {
      case 'business_name':
        return 'Business Already Exists';
      case 'customer_name':
        return 'Customer Already Exists';
      default:
        return 'Account Already Exists';
    }
  };

  if (showPasswordReset) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address to receive password reset instructions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="your@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="welp-input"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowPasswordReset(false)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handlePasswordReset}
                disabled={isResetting || !resetEmail}
                className="welp-button flex-1"
              >
                {isResetting ? "Sending..." : "Send Reset Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDuplicateMessage()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {!duplicateResult.allowContinue && (
            <>
              <Button
                onClick={handleSignIn}
                className="welp-button w-full"
              >
                Sign In Instead
              </Button>
              
              <Button
                onClick={() => setShowPasswordReset(true)}
                variant="outline"
                className="w-full"
              >
                Forgot Password?
              </Button>
            </>
          )}
          
          {duplicateResult.allowContinue && (
            <>
              <Button
                onClick={onClose}
                className="welp-button w-full"
              >
                Continue Anyway
              </Button>
              
              {duplicateResult.duplicateType === 'business_name' && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                >
                  Go Back and Change Information
                </Button>
              )}
              
              {duplicateResult.duplicateType === 'customer_name' && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                >
                  Go Back and Change Information
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
