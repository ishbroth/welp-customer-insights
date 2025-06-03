
import { Button } from "@/components/ui/button";

interface BusinessReviewsShowAllButtonProps {
  totalReviews: number;
  onShowAll: () => void;
}

const BusinessReviewsShowAllButton = ({ totalReviews, onShowAll }: BusinessReviewsShowAllButtonProps) => {
  return (
    <div className="text-center">
      <Button 
        variant="outline" 
        onClick={onShowAll}
      >
        Show All {totalReviews} Reviews
      </Button>
    </div>
  );
};

export default BusinessReviewsShowAllButton;
