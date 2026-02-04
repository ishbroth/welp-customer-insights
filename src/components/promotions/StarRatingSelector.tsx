import { Star } from "lucide-react";

interface StarRatingSelectorProps {
  selectedRating: number | null;
  onRatingChange: (rating: number) => void;
  customerCount?: number;
}

const ratingDescriptions: Record<number, string> = {
  5: "Targeting customers with 4.5+ average ratings",
  4: "Targeting customers with 3.5+ average ratings",
  3: "Targeting customers with 2.5+ average ratings",
  2: "Targeting customers with 1.5+ average ratings",
  1: "Targeting all customers",
};

const StarRatingSelector = ({ selectedRating, onRatingChange, customerCount }: StarRatingSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Target Star Rating</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-7 w-7 ${
                selectedRating && star <= selectedRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
      {selectedRating && (
        <p className="text-sm text-muted-foreground">
          {ratingDescriptions[selectedRating]}
        </p>
      )}
      {customerCount !== undefined && (
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          This promotion will be sent to {customerCount} customers
        </p>
      )}
    </div>
  );
};

export default StarRatingSelector;
