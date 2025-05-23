
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";

interface CustomerResponseFormProps {
  onSubmit: (responseText: string) => void;
  isSubmitting: boolean;
}

const CustomerResponseForm = ({ 
  onSubmit, 
  isSubmitting 
}: CustomerResponseFormProps) => {
  const [responseText, setResponseText] = useState("");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      toast({
        title: "Empty response",
        description: "Please write something before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Add content moderation check
    const moderationResult = moderateContent(responseText);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }
    
    onSubmit(responseText);
    setResponseText("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-3">
        <Textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Write your response to this review..."
          className="w-full min-h-[100px] mb-2"
          required
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {responseText.length}/1000 characters
          </div>
          <div className="space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onSubmit("")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="welp-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
          </div>
        </div>
      </form>
      
      {/* Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
        onClose={() => setShowRejectionDialog(false)}
      />
    </>
  );
};

export default CustomerResponseForm;
