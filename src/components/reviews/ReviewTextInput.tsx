
import React from "react";

interface ReviewTextInputProps {
  comment: string;
  setComment: (comment: string) => void;
}

const ReviewTextInput: React.FC<ReviewTextInputProps> = ({
  comment,
  setComment,
}) => {
  return (
    <div>
      <label htmlFor="reviewText" className="block text-sm font-medium mb-2">
        Review
      </label>
      <textarea
        id="reviewText"
        rows={6}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Describe your experience with this customer..."
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
