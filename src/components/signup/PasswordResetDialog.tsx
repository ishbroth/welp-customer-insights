
import { useState } from "react";
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

interface PasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  initialEmail: string;
}

export const PasswordResetDialog = ({
  isOpen,
  onClose,
  onBack,
  initialEmail
}: PasswordResetDialogProps) => {
  const [resetEmail, setResetEmail] = useState(initialEmail);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

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
              onClick={onBack}
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
};
