
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Review } from "@/types";

interface BusinessReviewCardActionsProps {
  review: Review;
  onEdit: (review: Review) => void;
  handleDeleteClick: () => void;
}

const BusinessReviewCardActions: React.FC<BusinessReviewCardActionsProps> = ({
  review,
  onEdit,
  handleDeleteClick,
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-2 border-t">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onEdit(review)}
        className="bg-white hover:bg-gray-100 shadow-sm"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDeleteClick}
        className="bg-white hover:bg-gray-100 text-red-500 hover:text-red-700 shadow-sm"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BusinessReviewCardActions;
