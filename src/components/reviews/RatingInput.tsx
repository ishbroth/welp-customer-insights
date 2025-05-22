
import React from "react";
import { Star } from "lucide-react";

interface RatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  hoverRating: number;
  setHoverRating: (rating: number) => void;
}

const RatingInput: React.FC<RatingInputProps> = ({
  rating,
  setRating,
  hoverRating,
  setHoverRating,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Rating</label>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-10 w-10 cursor-pointer ${
              star <= (hoverRating || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          />
        ))}
        
        <span className="ml-4 text-lg">
          {rating > 0 ? (
            <span>
              <span className="font-medium">{rating}</span>/5
            </span>
          ) : (
            "Select a rating"
          )}
        </span>
      </div>
    </div>
  );
};

export default RatingInput;
