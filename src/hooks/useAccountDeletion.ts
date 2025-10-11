
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useAccountDeletion');

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const deleteAccount = async () => {
    if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data.")) {
      return false;
    }

    if (!confirm("This will permanently delete:\n- Your profile and account\n- All reviews you've written\n- All responses and interactions\n- All business information\n- All stored data\n\nType 'DELETE' in the next prompt to confirm.")) {
      return false;
    }

    const confirmation = prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmation !== 'DELETE') {
      toast({
        title: "Account deletion cancelled",
        description: "You must type 'DELETE' exactly to confirm.",
        variant: "default",
      });
      return false;
    }

    setIsDeleting(true);

    try {
      hookLogger.info("Starting account deletion process");

      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        hookLogger.error("Account deletion error:", error);
        throw error;
      }

      hookLogger.info("Account deletion successful:", data);
      
      // Log out the user since their account no longer exists
      await logout();
      
      // Show success popup instead of immediately redirecting
      setShowSuccessPopup(true);
      
      return true;

    } catch (error: any) {
      hookLogger.error("Account deletion failed:", error);
      
      toast({
        title: "Account deletion failed",
        description: error.message || "An error occurred while deleting your account. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    // Redirect to home page after popup is closed
    window.location.href = '/';
  };

  return {
    deleteAccount,
    isDeleting,
    showSuccessPopup,
    handleSuccessPopupClose
  };
};
