
import React from "react";
import { useNavigate } from "react-router-dom";
import DuplicateReviewDialog from "@/components/reviews/DuplicateReviewDialog";

interface DuplicateReviewHandlerProps {
  showDuplicateDialog: boolean;
  setShowDuplicateDialog: (show: boolean) => void;
  existingReview: any;
  customerFirstName: string;
  customerLastName: string;
}

const DuplicateReviewHandler: React.FC<DuplicateReviewHandlerProps> = ({
  showDuplicateDialog,
  setShowDuplicateDialog,
  existingReview,
  customerFirstName,
  customerLastName,
}) => {
  const navigate = useNavigate();

  const handleEditExisting = () => {
    setShowDuplicateDialog(false);
    if (existingReview) {
      const reviewDataForEdit = {
        id: existingReview.id,
        rating: existingReview.rating,
        content: existingReview.content,
        customerName: existingReview.customer_name,
        address: existingReview.customer_address || "",
        city: existingReview.customer_city || "",
        zipCode: existingReview.customer_zipcode || "",
        phone: existingReview.customer_phone || ""
      };
      
      navigate(`/new-review?edit=true&reviewId=${existingReview.id}`, {
        state: {
          reviewData: reviewDataForEdit,
          isEditing: true
        }
      });
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateDialog(false);
    navigate("/profile/business-reviews");
  };

  return (
    <DuplicateReviewDialog
      open={showDuplicateDialog}
      onOpenChange={setShowDuplicateDialog}
      onEditExisting={handleEditExisting}
      onCancel={handleCancelDuplicate}
      customerName={`${customerFirstName} ${customerLastName}`.trim()}
    />
  );
};

export default DuplicateReviewHandler;
