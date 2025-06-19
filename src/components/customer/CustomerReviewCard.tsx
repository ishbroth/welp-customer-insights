
import React from "react";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Review } from "@/types";
import ReviewReactions from "@/components/ReviewReactions";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import { useReactionPersistence } from "@/hooks/useReactionPersistence";
import { useAuth } from "@/contexts/auth";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

interface CustomerReviewCardProps {
  review: Review & {
    customerAvatar?: string;
  };
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchase: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

// Helper function to extract the first three words of a text
const getFirstThreeWords = (text: string): string => {
  const words = text.split(' ');
  const firstThree = words.slice(0, 3).join(' ');
  return `${firstThree}${words.length > 3 ? '...' : ''}`;
};

const CustomerReviewCard: React.FC<CustomerReviewCardProps> = ({
  review,
  isUnlocked,
  hasSubscription,
  onPurchase,
  onReactionToggle,
}) => {
  const { isSubscribed, currentUser } = useAuth();
  const navigate = useNavigate();
  const { reactions, toggleReaction } = useReactionPersistence(
    review.id, 
    review.reactions || { like: [], funny: [], ohNo: [] }
  );

  // Fetch business profile for avatar
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', review.reviewerId],
    queryFn: async () => {
      console.log(`CustomerReviewCard: Fetching business profile for ID: ${review.reviewerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("CustomerReviewCard: Error fetching business profile:", error);
        return null;
      }

      console.log(`CustomerReviewCard: Business profile found:`, data);
      return data;
    },
    enabled: !!review.reviewerId
  });

  // Fetch verification status for the business
  const { isVerified: businessIsVerified } = useVerifiedStatus(review.reviewerId);

  // Fetch customer profile for avatar if we have a customer ID but no avatar
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      console.log(`CustomerReviewCard: Fetching customer profile for ID: ${review.customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("CustomerReviewCard: Error fetching customer profile:", error);
        return null;
      }

      console.log(`CustomerReviewCard: Customer profile found:`, data);
      return data;
    },
    enabled: !!review.customerId && !review.customerAvatar
  });

  const handlePurchaseClick = () => {
    onPurchase(review.id);
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
    console.log('Handling reaction toggle:', reactionType, 'for review:', reviewId);
    toggleReaction(reactionType as keyof typeof reactions);
    onReactionToggle(reviewId, reactionType);
  };

  const handleResponseSubmitted = (newResponse: any) => {
    // Handle response submission if needed
    console.log('Response submitted:', newResponse);
  };

  const handleBusinessNameClick = () => {
    // Only allow navigation if user is subscribed or has unlocked this review
    if (isSubscribed || isUnlocked) {
      navigate(`/business/${review.reviewerId}`);
    }
  };

  // Check if current user is the business who wrote this review
  const isReviewAuthor = currentUser?.id === review.reviewerId;

  // Get the final avatar URLs - prioritize businessProfile data
  const finalBusinessAvatar = businessProfile?.avatar || review.reviewerAvatar || '';
  const finalCustomerAvatar = review.customerAvatar || customerProfile?.avatar || '';

  console.log('CustomerReviewCard: Avatar and verification info:', {
    reviewId: review.id,
    businessAvatar: finalBusinessAvatar,
    customerAvatar: finalCustomerAvatar,
    reviewerName: review.reviewerName,
    customerName: review.customerName,
    businessIsVerified
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Business Avatar */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={finalBusinessAvatar} alt={review.reviewerName} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getBusinessInitials()}
              </AvatarFallback>
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
                {/* Show verified badge next to business name if verified */}
                {businessIsVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Customer Avatar - show on the right */}
        {review.customerName && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">About:</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={finalCustomerAvatar} alt={review.customerName} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {getCustomerInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">{review.customerName}</span>
          </div>
        )}
      </div>

      {isUnlocked ? (
        <div>
          <p className="text-gray-700">{review.content}</p>
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            Full review unlocked
          </div>
          
          {/* Reactions for unlocked reviews - only show if user is not the review author */}
          {!isReviewAuthor && (
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
          
          {/* Customer review responses component with proper conversation flow */}
          <CustomerReviewResponse 
            reviewId={review.id}
            responses={review.responses || []}
            hasSubscription={hasSubscription}
            isOneTimeUnlocked={isUnlocked && !hasSubscription}
            hideReplyOption={false}
            onResponseSubmitted={handleResponseSubmitted}
            reviewAuthorId={review.reviewerId} // Pass the review author ID
          />
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
        </div>
      )}
    </div>
  );
};

export default CustomerReviewCard;
