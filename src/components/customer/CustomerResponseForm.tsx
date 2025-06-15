
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CustomerResponseFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  onCancel: () => void;
}

const CustomerResponseForm: React.FC<CustomerResponseFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(content);
    setIsSubmitting(false);
    
    if (success) {
      setContent("");
      onCancel();
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your response..."
        className="min-h-[100px]"
      />
      <div className="flex space-x-2">
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CustomerResponseForm;
