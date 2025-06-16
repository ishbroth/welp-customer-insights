
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Fetch comprehensive business profile data
  const { data: fullBusinessProfile } = useQuery({
    queryKey: ['fullBusinessProfile', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      console.log("Fetching full business profile for claim dialog:", businessId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          avatar,
          phone,
          address,
          city,
          state,
          zipcode,
          bio,
          business_info:business_info(
            business_name,
            website,
            business_category,
            business_subcategory
          )
        `)
        .eq('id', businessId)
        .eq('type', 'business')
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching full business profile:", error);
        return null;
      }
      
      console.log("Full business profile fetched:", data);
      return data;
    },
    enabled: !!businessId && open,
  });

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
  const businessName = displayData?.name || businessData?.name || 'Business';
  const businessAvatar = displayData?.avatar || businessData?.avatar || '';
  
  // Check if we have comprehensive business information to display
  const hasBusinessInfo = displayData?.name || 
                         displayData?.phone || 
                         displayData?.address || 
                         displayData?.city || 
                         displayData?.state ||
                         displayData?.zipcode ||
                         (fullBusinessProfile?.business_info && fullBusinessProfile.business_info.website);

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
                  {businessAvatar ? (
                    <AvatarImage src={businessAvatar} alt={businessName} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {getBusinessInitials(businessName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{businessName}</h3>
                  {fullBusinessProfile?.business_info?.business_category && (
                    <p className="text-sm text-gray-600">{fullBusinessProfile.business_info.business_category}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 ml-15">
                {displayData?.phone && (
                  <div>
                    <span className="font-medium">Phone: </span>
                    <span>{displayData.phone}</span>
                  </div>
                )}
                {displayData?.address && (
                  <div>
                    <span className="font-medium">Address: </span>
                    <span>{displayData.address}</span>
                  </div>
                )}
                {(displayData?.city || displayData?.state || displayData?.zipcode) && (
                  <div>
                    <span className="font-medium">Location: </span>
                    <span>
                      {displayData.city}
                      {displayData.city && displayData.state ? ", " : ""}
                      {displayData.state} {displayData.zipcode}
                    </span>
                  </div>
                )}
                {fullBusinessProfile?.business_info?.website && (
                  <div>
                    <span className="font-medium">Website: </span>
                    <span className="text-blue-600">{fullBusinessProfile.business_info.website}</span>
                  </div>
                )}
                {fullBusinessProfile?.bio && (
                  <div>
                    <span className="font-medium">About: </span>
                    <span>{fullBusinessProfile.bio}</span>
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
