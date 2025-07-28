
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResponseFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  onCancel?: () => void;
  reviewId?: string;
  reviewerName?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
}

const ResponseForm: React.FC<ResponseFormProps> = ({
  onSubmit,
  onCancel,
  reviewId,
  reviewerName,
  isSubmitting = false,
  canSubmit = true
}) => {
  const [responseText, setResponseText] = useState("");

  const handleSubmit = async () => {
    if (!responseText.trim()) return;
    
    const success = await onSubmit(responseText);
    if (success) {
      setResponseText("");
    }
  };

  if (!canSubmit) {
    return null;
  }

  return (
    <div className="border-t pt-4">
      <Textarea
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder="Write your response..."
        className="w-full mb-3 min-h-[100px]"
        maxLength={1500}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !responseText.trim()}
          className="px-6"
        >
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </Button>
      </div>
    </div>
  );
};

export default ResponseForm;
