
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface ReviewTextInputProps {
  comment: string;
  setComment: (comment: string) => void;
}

const ReviewTextInput: React.FC<ReviewTextInputProps> = ({
  comment,
  setComment,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > 0) {
      // Capitalize the first letter
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      setComment(capitalizedValue);
    } else {
      setComment(value);
    }
  };

  return (
    <div>
      <label htmlFor="reviewText" className="block text-sm font-medium mb-2">
        Review
      </label>
      <Textarea
        id="reviewText"
        rows={6}
        value={comment}
        onChange={handleChange}
        placeholder="Describe the customer and your experience with them..."
        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-welp-primary focus:border-transparent"
        maxLength={1500}
      />
      <div className="text-xs text-gray-500 mt-1">
        {comment.length}/1500 characters
      </div>
    </div>
  );
};

export default ReviewTextInput;
