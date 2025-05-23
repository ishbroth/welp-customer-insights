
import StarRating from "@/components/StarRating";

interface ReviewHeaderProps {
  businessName: string;
  rating: number;
  location: string;
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  businessName,
  rating,
  location
}) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <div className="font-bold text-lg">{businessName}</div>
        <StarRating rating={rating} size="md" />
      </div>
      <div className="text-sm text-gray-500">{location}</div>
    </div>
  );
};

export default ReviewHeader;
