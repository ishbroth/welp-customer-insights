import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";

interface ConversationInputProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  isSubmitting?: boolean;
  maxLength?: number;
}

const ConversationInput: React.FC<ConversationInputProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Write your response...",
  isSubmitting = false,
  maxLength = 1500
}) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please enter a response");
      return;
    }

    if (content.length > maxLength) {
      setError(`Response must be ${maxLength} characters or less`);
      return;
    }

    try {
      setError("");
      await onSubmit(content.trim());
      setContent("");
    } catch (err) {
      setError("Failed to send response. Please try again.");
      console.error("Error submitting response:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[100px] resize-none"
          disabled={isSubmitting}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className={isOverLimit ? "text-destructive" : ""}>
              {remainingChars} characters remaining
            </span>
            <span className="ml-2 text-muted-foreground/70">
              (Ctrl+Enter to send)
            </span>
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim() || isOverLimit}
        >
          <Send className="h-4 w-4 mr-1" />
          {isSubmitting ? "Sending..." : "Send Response"}
        </Button>
      </div>
    </div>
  );
};

export default ConversationInput;