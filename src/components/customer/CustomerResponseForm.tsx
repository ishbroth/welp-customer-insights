
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useArchivedResponses } from "@/hooks/useArchivedResponses";

interface CustomerResponseFormProps {
  onSubmit: (responseText: string) => void;
  isSubmitting: boolean;
  reviewId?: string;
}

const CustomerResponseForm = ({ onSubmit, isSubmitting, reviewId }: CustomerResponseFormProps) => {
  const [responseText, setResponseText] = useState("");
  const { archivedResponse, clearArchivedResponse } = useArchivedResponses(reviewId || "");

  // Autofill with archived response when component mounts
  useEffect(() => {
    if (archivedResponse && !responseText) {
      setResponseText(archivedResponse);
    }
  }, [archivedResponse, responseText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(responseText);
    setResponseText("");
    
    // Clear archived response after successful submission
    if (archivedResponse) {
      clearArchivedResponse();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <Textarea
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder={archivedResponse ? "Your previous response has been restored. Edit if needed..." : "Write your response..."}
        className="w-full min-h-[100px] mb-3"
        maxLength={1500}
        disabled={isSubmitting}
      />
      
      {archivedResponse && (
        <p className="text-sm text-blue-600 mb-2">
          💡 Your previous response has been restored. You can edit it or write a new one.
        </p>
      )}
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setResponseText("");
            if (archivedResponse) clearArchivedResponse();
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!responseText.trim() || isSubmitting}
          className="welp-button"
        >
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerResponseForm;
