
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResponseFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  reviewId: string;
  reviewerName: string;
}

const ResponseForm: React.FC<ResponseFormProps> = ({
  onSubmit,
  onCancel,
  reviewId,
  reviewerName,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`Write your response to ${reviewerName}...`}
        className="min-h-[100px]"
        required
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={!content.trim()}>
          Submit Response
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ResponseForm;
