
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BusinessReviewsEmptyState = () => {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
      <p className="text-gray-500 mb-4">
        You haven't written any customer reviews yet.
      </p>
      <Link to="/review/new">
        <Button className="bg-[#ea384c] hover:bg-[#d63384] text-white">
          Write Your First Review
        </Button>
      </Link>
    </Card>
  );
};

export default BusinessReviewsEmptyState;
