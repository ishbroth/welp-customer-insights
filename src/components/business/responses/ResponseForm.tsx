
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResponseFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ResponseForm: React.FC<ResponseFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [responseContent, setResponseContent] = useState("");

  const handleSubmit = async () => {
    if (!responseContent.trim()) return;
    
    const success = await onSubmit(responseContent);
    if (success) {
      setResponseContent("");
    }
  };

  const handleCancel = () => {
    setResponseContent("");
    onCancel();
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
      <h5 className="font-medium mb-2">Respond to Customer</h5>
      <Textarea
        value={responseContent}
        onChange={(e) => setResponseContent(e.target.value)}
        placeholder="Write your response to the customer..."
        className="w-full mb-3 min-h-[80px]"
        maxLength={1500}
      />
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSubmit}
          disabled={isSubmitting || !responseContent.trim()}
        >
          {isSubmitting ? "Sending..." : "Send Response"}
        </Button>
      </div>
    </div>
  );
};

export default ResponseForm;
