
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBusinessInitials } from "./enhancedReviewCardUtils";

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
  businessData?: {
    name?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

const ClaimReviewDialog: React.FC<ClaimReviewDialogProps> = ({
  open,
  onOpenChange,
  reviewData,
  businessData,
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

  // Check if we have business information to display
  const hasBusinessInfo = businessData?.name || 
                         businessData?.phone || 
                         businessData?.address || 
                         businessData?.city || 
                         businessData?.state ||
                         businessData?.zipcode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Do you know this business?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {hasBusinessInfo ? (
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  {businessData?.avatar ? (
                    <AvatarImage src={businessData.avatar} alt={businessData.name} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {getBusinessInitials(businessData?.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{businessData?.name}</h3>
                </div>
              </div>
              
              <div className="space-y-2 ml-15">
                {businessData?.phone && (
                  <div>
                    <span className="font-medium">Phone: </span>
                    <span>{businessData.phone}</span>
                  </div>
                )}
                {businessData?.address && (
                  <div>
                    <span className="font-medium">Address: </span>
                    <span>{businessData.address}</span>
                  </div>
                )}
                {(businessData?.city || businessData?.state || businessData?.zipcode) && (
                  <div>
                    <span className="font-medium">Location: </span>
                    <span>
                      {businessData.city}
                      {businessData.city && businessData.state ? ", " : ""}
                      {businessData.state} {businessData.zipcode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600 italic">
                Business information is not available for this review.
              </p>
            </div>
          )}
          
          <p className="text-sm font-medium text-center">
            Claim this review to respond to the business that wrote it!
          </p>
        </div>

        <DialogFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            Go Back
          </Button>
          <Button onClick={handleConfirm}>
            Yes, This Is About Me
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimReviewDialog;
