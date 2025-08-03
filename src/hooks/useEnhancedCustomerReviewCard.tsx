import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface DetailedMatch {
  field: string;
  reviewValue: string;
  searchValue: string;
  similarity: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

interface Reactions {
  like: string[];
  funny: string[];
  useful: string[];
  ohNo: string[];
}

export const useEnhancedCustomerReviewCard = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchase,
  onReactionToggle,
}: any) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [isClaimingReview, setIsClaimingReview] = useState(false);
  const [reactions, setReactions] = useState<Reactions>({
    like: [],
    funny: [],
    useful: [],
    ohNo: [],
  });

  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [customerProfile, setCustomerProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (review.reviewerId) {
        const { data: businessData, error: businessError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', review.reviewerId)
          .single();

        if (businessError) {
          console.error("Error fetching business profile:", businessError);
        } else {
          setBusinessProfile(businessData);
        }
      }

      if (review.customerId) {
        const { data: customerData, error: customerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', review.customerId)
          .single();

        if (customerError) {
          console.error("Error fetching customer profile:", customerError);
        } else {
          setCustomerProfile(customerData);
        }
      }
    };

    fetchProfiles();
  }, [review.reviewerId, review.customerId]);

  const isReviewAuthor = currentUser?.id === review.reviewerId;
  const isCustomerBeingReviewed = currentUser?.id === review.customerId;
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
  const isCustomerUser = currentUser?.type === "customer";

  const isBusinessVerified = businessProfile?.verified || false;
  const isCustomerVerified = customerProfile?.verified || false;

  const finalBusinessAvatar = businessProfile?.avatar || review.reviewerAvatar || "";
  const finalCustomerAvatar = customerProfile?.avatar || review.customerAvatar || "";

  // Check if review is actually claimed by checking customerId field
  const isReviewClaimed = !!review.customerId;

  const handlePurchaseClick = () => {
    onPurchase(review.id);
  };

  const handleClaimClick = () => {
    setShowClaimDialog(true);
  };

  const handleClaimConfirm = async () => {
    setIsClaimingReview(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ customer_id: currentUser?.id })
        .eq('id', review.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Review Claimed",
        description: "This review is now linked to your profile.",
      });
    } catch (error) {
      console.error("Error claiming review:", error);
      toast({
        title: "Error",
        description: "Failed to claim this review.",
        variant: "destructive",
      });
    } finally {
      setIsClaimingReview(false);
      setShowClaimDialog(false);
    }
  };

  const handleClaimCancel = () => {
    setShowClaimDialog(false);
  };

  const handleReactionToggle = (reactionType: string) => {
    onReactionToggle(review.id, reactionType);
  };

  const handleBusinessNameClick = () => {
    // If current user is the business owner of this review, go to their own profile
    if (currentUser?.id === review.reviewerId) {
      navigate('/profile');
    } else {
      // Navigate to business profile with read-only view
      navigate(`/business-profile/${review.reviewerId}`, {
        state: { 
          readOnly: true,
          showRespondButton: currentUser?.type === 'customer',
          reviewId: review.id
        }
      });
    }
  };

  return {
    showClaimDialog,
    setShowClaimDialog,
    reactions,
    businessProfile,
    customerProfile,
    isReviewAuthor,
    isCustomerBeingReviewed,
    isBusinessUser,
    isCustomerUser,
    isBusinessVerified,
    isCustomerVerified,
    finalBusinessAvatar,
    finalCustomerAvatar,
    isReviewClaimed,
    isClaimingReview,
    handlePurchaseClick,
    handleClaimClick,
    handleClaimConfirm,
    handleClaimCancel,
    handleReactionToggle,
    handleBusinessNameClick,
  };
};
