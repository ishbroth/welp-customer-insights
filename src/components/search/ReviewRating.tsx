
import { Star } from "lucide-react";

interface ReviewRatingProps {
  rating: number;
}

const ReviewRating = ({ rating }: ReviewRatingProps) => {
  const validRating = Number(rating) || 0;

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < validRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default ReviewRating;
