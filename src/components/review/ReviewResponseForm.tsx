
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewResponseFormProps {
  response: string;
  setResponse: (response: string) => void;
  handleSubmitResponse: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const ReviewResponseForm: React.FC<ReviewResponseFormProps> = ({
  response,
  setResponse,
  handleSubmitResponse,
  isSubmitting
}) => {
  return (
    <form onSubmit={handleSubmitResponse} className="mt-4 border-t pt-4">
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your response to this review..."
        className="w-full p-3 border rounded-md min-h-[100px] focus:ring-2 focus:ring-welp-primary focus:border-transparent"
        maxLength={1500}
        required
      />
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-500">
          {response.length}/1500 characters
        </div>
        <Button 
          type="submit" 
          className="welp-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </Button>
      </div>
    </form>
  );
};

export default ReviewResponseForm;
