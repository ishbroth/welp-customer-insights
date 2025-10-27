
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ClaimReviewBusinessInfo from "./ClaimReviewBusinessInfo";
import { useClaimReviewDialog } from "@/hooks/useClaimReviewDialog";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";
import { logger } from '@/utils/logger';

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
  businessId?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ClaimReviewDialog: React.FC<ClaimReviewDialogProps> = ({
  open,
  onOpenChange,
  reviewData,
  businessData,
  businessId,
  onConfirm,
  onCancel,
}) => {
  const componentLogger = logger.withContext('ClaimReviewDialog');
  const { fullBusinessProfile, isLoading } = useClaimReviewDialog(businessId);

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  // Use full profile data if available, otherwise fall back to businessData
  const displayData = fullBusinessProfile || businessData;

  // Handle business name - prioritize business_info.business_name, then profile name, then businessData name
  const businessName = (fullBusinessProfile?.business_info && 'business_name' in fullBusinessProfile.business_info && typeof fullBusinessProfile.business_info.business_name === 'string')
                      ? fullBusinessProfile.business_info.business_name
                      : fullBusinessProfile?.name ||
                        businessData?.name ||
                        'Business';

  const businessAvatar = displayData?.avatar || '';

  componentLogger.debug('Rendering with data:', {
    businessId,
    fullBusinessProfile: fullBusinessProfile ? 'loaded' : 'not loaded',
    businessName,
    businessInfoName: (fullBusinessProfile?.business_info && 'business_name' in fullBusinessProfile.business_info && typeof fullBusinessProfile.business_info.business_name === 'string') ? fullBusinessProfile.business_info.business_name : undefined,
    profileName: fullBusinessProfile?.name,
    businessDataName: businessData?.name,
    displayData: displayData ? 'found' : 'not found',
    isLoading,
    open
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Do you know this business?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <WelpLoadingIcon size={60} />
            </div>
          ) : (
            <ClaimReviewBusinessInfo
              businessName={businessName}
              businessAvatar={businessAvatar}
              displayData={displayData}
              fullBusinessProfile={fullBusinessProfile}
            />
          )}
          
          <p className="text-sm font-medium text-center">
            Claim this review to respond to the business that wrote it!
          </p>
        </div>

        <DialogFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            Go Back
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            Yes, This Is About Me
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimReviewDialog;
