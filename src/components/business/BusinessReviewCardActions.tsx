
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessReviewCardActionsProps {
  onEdit: () => void;
  handleDeleteClick: () => void;
}

const BusinessReviewCardActions: React.FC<BusinessReviewCardActionsProps> = ({
  onEdit,
  handleDeleteClick,
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-2 border-t">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onEdit}
        className="bg-white hover:bg-gray-100 shadow-sm px-2 sm:px-3 py-1"
      >
        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDeleteClick}
        className="bg-white hover:bg-gray-100 text-red-500 hover:text-red-700 shadow-sm px-2 sm:px-3 py-1"
      >
        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default BusinessReviewCardActions;
