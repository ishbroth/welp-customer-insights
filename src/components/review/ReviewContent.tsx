
import { formatRelative } from "@/utils/dateUtils";

interface ReviewContentProps {
  comment: string;
  createdAt: string;
}

const ReviewContent = ({ comment, createdAt }: ReviewContentProps) => {
  return (
    <>
      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-line">{comment}</p>
      </div>

      <div className="text-sm text-gray-500">
        <span>
          {formatRelative(createdAt)}
        </span>
      </div>
    </>
  );
};

export default ReviewContent;
