
import { useState } from "react";
import { moderateContent } from "@/utils/contentModeration";

export const useContentValidation = () => {
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const validateContent = (content: string): boolean => {
    const moderationResult = moderateContent(content);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return false;
    }
    return true;
  };

  return {
    rejectionReason,
    showRejectionDialog,
    setShowRejectionDialog,
    validateContent
  };
};
