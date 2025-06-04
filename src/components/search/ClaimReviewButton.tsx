
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClaimReviewButtonProps {
  reviewId: string;
  customerName: string;
  onReviewClaimed: () => void;
}

const ClaimReviewButton = ({ reviewId, customerName, onReviewClaimed }: ClaimReviewButtonProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isClaining, setIsClaining] = useState(false);

  const handleClaimReview = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to claim this review.",
        variant: "destructive"
      });
      return;
    }

    setIsClaining(true);
    
    try {
      // Update the review to link it to the current user's customer ID
      const { error } = await supabase
        .from('reviews')
        .update({ customer_id: currentUser.id })
        .eq('id', reviewId);

      if (error) {
        throw error;
      }

      toast({
        title: "Review Claimed Successfully",
        description: `The review for ${customerName} has been linked to your account.`,
      });

      onReviewClaimed();
    } catch (error) {
      console.error('Error claiming review:', error);
      toast({
        title: "Error Claiming Review",
        description: "There was an error linking this review to your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClaining(false);
    }
  };

  return (
    <Button
      onClick={handleClaimReview}
      disabled={isClaining}
      size="sm"
      variant="outline"
      className="flex items-center gap-2"
    >
      <UserCheck className="h-4 w-4" />
      {isClaining ? "Claiming..." : "Claim this Review"}
    </Button>
  );
};

export default ClaimReviewButton;
