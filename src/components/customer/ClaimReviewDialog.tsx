
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClaimReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewData: {
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCity?: string;
    customerZipcode?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

const ClaimReviewDialog: React.FC<ClaimReviewDialogProps> = ({
  open,
  onOpenChange,
  reviewData,
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim This Review</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            The business owner provided the following information when writing this review:
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            {reviewData.customerName && (
              <div>
                <span className="font-medium">Name: </span>
                <span>{reviewData.customerName}</span>
              </div>
            )}
            {reviewData.customerPhone && (
              <div>
                <span className="font-medium">Phone: </span>
                <span>{reviewData.customerPhone}</span>
              </div>
            )}
            {reviewData.customerAddress && (
              <div>
                <span className="font-medium">Address: </span>
                <span>{reviewData.customerAddress}</span>
              </div>
            )}
            {reviewData.customerCity && (
              <div>
                <span className="font-medium">City: </span>
                <span>{reviewData.customerCity}</span>
              </div>
            )}
            {reviewData.customerZipcode && (
              <div>
                <span className="font-medium">Zip Code: </span>
                <span>{reviewData.customerZipcode}</span>
              </div>
            )}
          </div>
          
          <p className="text-sm font-medium text-center">
            Are you sure this review was written about you?
          </p>
        </div>

        <DialogFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            Go Back
          </Button>
          <Button onClick={handleConfirm}>
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimReviewDialog;
