
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit } from "lucide-react";

interface BusinessReviewsHeaderProps {
  reviewCount: number;
}

const BusinessReviewsHeader = ({ reviewCount }: BusinessReviewsHeaderProps) => {
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Customer Reviews</h1>
          <p className="text-gray-600">
            Manage the reviews you've written about customers.
          </p>
        </div>
        <Button asChild>
          <Link to="/review/new">
            <Edit className="mr-2 h-4 w-4" />
            Write New Review
          </Link>
        </Button>
      </div>
      
      <div className="flex justify-between mb-6">
        <div>
          <span className="text-gray-600">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} total
          </span>
        </div>
      </div>
    </>
  );
};

export default BusinessReviewsHeader;
