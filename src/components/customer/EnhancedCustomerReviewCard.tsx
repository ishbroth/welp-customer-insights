
import React, { useState } from "react";
import { Eye, Lock, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Review } from "@/types";
import ReviewReactions from "@/components/ReviewReactions";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import { useReactionPersistence } from "@/hooks/useReactionPersistence";
import { useAuth } from "@/contexts/auth";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useReviewClaiming } from "@/hooks/useReviewClaiming";
import ClaimReviewDialog from "@/components/customer/ClaimReviewDialog";

interface EnhancedCustomerReviewCardProps {
  review: Review & {
    customerAvatar?: string;
    matchType?: 'claimed' | 'high_quality' | 'potential';
    matchReasons?: string[];
    matchScore?: number;
    isNewReview?: boolean;
    customer_phone?: string;
  };
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchase: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

const EnhancedCustomerReviewCard: React.FC<EnhancedCustomerReviewCardProps> = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchase,
  onReactionToggle,
}) => {
  const { isSubscribed, currentUser } = useAuth();
  const navigate = useNavigate();
  const { claimReview, isClaimingReview } = useReviewClaiming();
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const { reactions, toggleReaction } = useReactionPersistence(
    review.id, 
    review.reactions || { like: [], funny: [], ohNo: [] }
  );

  // Fetch business profile for avatar if not already provided
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', review.reviewerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!review.reviewerId && !review.reviewerAvatar
  });

  // Fetch customer profile for avatar if we have a customer ID
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, phone')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!review.customerId
  });

  const handlePurchaseClick = () => {
    // For customer users who haven't claimed the review, show claim dialog first
    if (isCustomerUser && isCustomerBeingReviewed && !isReviewClaimed) {
      setShowClaimDialog(true);
    } else {
      onPurchase(review.id);
    }
  };

  const handleClaimReview = async () => {
    const success = await claimReview(review.id);
    if (success) {
      window.location.reload(); // Refresh to show updated data
    }
  };

  const handleClaimClick = () => {
    setShowClaimDialog(true);
  };

  const handleClaimConfirm = async () => {
    const success = await claimReview(review.id);
    if (success) {
      window.location.reload(); // Refresh to show updated data
    }
  };

  const handleClaimCancel = () => {
    // Dialog will close automatically
  };

  const getBusinessInitials = () => {
    if (review.reviewerName) {
      const names = review.reviewerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  const getCustomerInitials = () => {
    if (review.customerName) {
      const names = review.customerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    toggleReaction(reactionType as keyof typeof reactions);
    onReactionToggle(reviewId, reactionType);
  };

  const handleBusinessNameClick = () => {
    if (isSubscribed || isUnlocked) {
      navigate(`/business/${review.reviewerId}`);
    }
  };

  const isReviewAuthor = currentUser?.id === review.reviewerId;
  const isCustomerBeingReviewed = currentUser?.id === review.customerId;
  const isBusinessUser = currentUser?.type === "business";
  const isCustomerUser = currentUser?.type === "customer";
  const isVerified = review.reviewerVerified || false;
  const finalBusinessAvatar = review.reviewerAvatar || businessProfile?.avatar || '';
  const finalCustomerAvatar = review.customerAvatar || customerProfile?.avatar || '';

  // Check if this review has been claimed (matchType === 'claimed' indicates it's been claimed)
  const isReviewClaimed = review.matchType === 'claimed';

  // Determine if user can react to this review
  const canReact = () => {
    // Customer users can only react if they've claimed the review about them
    if (isCustomerUser && isCustomerBeingReviewed) {
      return isReviewClaimed;
    }
    
    // Business users can react to any customer review by other businesses
    if (isBusinessUser && !isReviewAuthor) {
      return true;
    }
    
    return false;
  };

  // Determine if user can respond to this review
  const canRespond = () => {
    // Customer users can only respond if they've claimed the review AND have subscription/one-time access
    if (isCustomerUser && isCustomerBeingReviewed && isReviewClaimed) {
      return hasSubscription || isUnlocked;
    }
    
    // Business users can respond if they have subscription/one-time access
    if (isBusinessUser && !isReviewAuthor) {
      return hasSubscription || isUnlocked;
    }
    
    return false;
  };

  // Get phone number to display
  const displayPhone = review.customer_phone || customerProfile?.phone;

  const getFirstThreeWords = (text: string): string => {
    const words = text.split(' ');
    const firstThree = words.slice(0, 3).join(' ');
    return `${firstThree}${words.length > 3 ? '...' : ''}`;
  };

  const renderMatchInfo = () => {
    if (!review.matchType || review.matchType === 'claimed') return null;

    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={review.matchType === 'high_quality' ? 'default' : 'secondary'}>
              {review.matchType === 'high_quality' ? 'High Match' : 'Potential Match'}
            </Badge>
            {review.isNewReview && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                New
              </Badge>
            )}
            <span className="text-sm text-blue-600">Score: {review.matchScore}%</span>
          </div>
          <Button 
            onClick={handleClaimClick}
            disabled={isClaimingReview}
            size="sm"
          >
            {isClaimingReview ? "Claiming..." : "Claim Review"}
          </Button>
        </div>
        <div className="text-sm text-blue-700">
          <strong>Match reasons:</strong> {review.matchReasons?.join(', ')}
        </div>
      </div>
    );
  };

  // Determine what to show based on user type and subscription status
  const shouldShowFullReview = () => {
    if (isCustomerUser && isCustomerBeingReviewed) {
      // For customer users viewing reviews about them:
      // If they have a subscription, show full review regardless of claim status
      // If they don't have subscription but have claimed + unlocked, show full review
      if (hasSubscription) return true;
      return isReviewClaimed && isUnlocked;
    }
    // For business users or other cases, use the existing isUnlocked logic
    return isUnlocked;
  };

  const shouldShowClaimButton = () => {
    // Show claim button for customer users who haven't claimed the review yet
    return isCustomerUser && isCustomerBeingReviewed && !isReviewClaimed;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
      {renderMatchInfo()}
      
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {finalBusinessAvatar ? (
                <AvatarImage src={finalBusinessAvatar} alt={review.reviewerName} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getBusinessInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {(isSubscribed || isUnlocked) ? (
                  <h3 
                    className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    onClick={handleBusinessNameClick}
                  >
                    {review.reviewerName}
                  </h3>
                ) : (
                  <h3 className="font-semibold">{review.reviewerName}</h3>
                )}
                {isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Customer Avatar with phone - show on the right */}
        {review.customerName && (
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm text-gray-500">About:</div>
              {displayPhone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-3 w-3 mr-1" />
                  {displayPhone}
                </div>
              )}
            </div>
            <Avatar className="h-8 w-8">
              {finalCustomerAvatar ? (
                <AvatarImage src={finalCustomerAvatar} alt={review.customerName} />
              ) : (
                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                  {getCustomerInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm font-medium text-gray-700">{review.customerName}</span>
          </div>
        )}
      </div>

      {shouldShowFullReview() ? (
        <div>
          <p className="text-gray-700">{review.content}</p>
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            Full review unlocked
          </div>
          
          {/* Only show reactions if user can react */}
          {canReact() && (
            <div className="mt-4 border-t pt-3">
              <div className="text-sm text-gray-500 mb-1">React to this review:</div>
              <ReviewReactions 
                reviewId={review.id}
                customerId={review.customerId}
                businessId={review.reviewerId}
                businessName={review.reviewerName}
                businessAvatar={finalBusinessAvatar}
                reactions={reactions}
                onReactionToggle={handleReactionToggle}
              />
            </div>
          )}
          
          {/* Only show response section if user can respond */}
          {canRespond() && (
            <CustomerReviewResponse 
              reviewId={review.id}
              responses={review.responses || []}
              hasSubscription={hasSubscription}
              isOneTimeUnlocked={isUnlocked && !hasSubscription}
              hideReplyOption={false}
              onResponseSubmitted={() => {}}
              reviewAuthorId={review.reviewerId}
            />
          )}
          
          {/* Show claim message for customer users who haven't claimed the review */}
          {shouldShowClaimButton() && (
            <div className="mt-4 flex justify-end">
              <p className="text-sm text-gray-500">
                To Respond, <button 
                  onClick={handleClaimClick}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Claim this Review
                </button>!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-gray-700">{getFirstThreeWords(review.content)}</p>
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Lock className="h-4 w-4 mr-2" />
                <span>Unlock full review for $3</span>
              </div>
              <Button 
                onClick={handlePurchaseClick}
                size="sm"
              >
                Purchase
              </Button>
            </div>
          </div>
          
          {/* Show claim message for unclaimed customer reviews even when locked */}
          {shouldShowClaimButton() && (
            <div className="mt-4 flex justify-end">
              <p className="text-sm text-gray-500">
                To Respond, <button 
                  onClick={handleClaimClick}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Claim this Review
                </button>!
              </p>
            </div>
          )}
        </div>
      )}

      <ClaimReviewDialog 
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        reviewData={{
          customerName: review.customerName,
          customerPhone: review.customer_phone,
          customerAddress: review.customer_address,
          customerCity: review.customer_city,
          customerZipcode: review.customer_zipcode,
        }}
        onConfirm={handleClaimConfirm}
        onCancel={handleClaimCancel}
      />
    </div>
  );
};

export default EnhancedCustomerReviewCard;
